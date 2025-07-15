package main

import (
	_ "embed"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

//go:embed greetings.json
var greetingsJson []byte

type Greeting struct {
	Language string `json:"language"`
	Greeting string `json:"greeting"`
	Locale   string `json:"locale"`
}

func main() {
	var greetings []*Greeting
	err := json.Unmarshal(greetingsJson, &greetings)
	if err != nil {
		fmt.Printf("error loading greetings: %s\n", err)
		os.Exit(1)
	}
	router := mux.NewRouter()

	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("got / request from %s\n", r.RemoteAddr)
		w.Header().Set("Content-Type", "application/json")
		greeting, err := SelectGreeting(greetings, "random")
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_, err = w.Write([]byte(FormatResponse(greeting)))
		if err != nil {
			panic(err)
		}
	}).Methods("GET")

	router.HandleFunc("/{language}", func(w http.ResponseWriter, r *http.Request) {
		language := mux.Vars(r)["language"]
		fmt.Printf("got /{language} request from %s\n", r.RemoteAddr)
		w.Header().Set("Content-Type", "application/json")
		greeting, err := SelectGreeting(greetings, language)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_, err = w.Write([]byte(FormatResponse(greeting)))
		if err != nil {
			panic(err)
		}
	}).Methods("GET")

	c := cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://greetings.kylepenfound.com",
			"https://dagger-demo.netlify.app",
			"http://localhost:8081",
		},
	})
	handler := c.Handler(router)
	err = http.ListenAndServe(":8080", handler)
	if errors.Is(err, http.ErrServerClosed) {
		fmt.Printf("server closed\n")
	} else if err != nil {
		fmt.Printf("error starting server: %s\n", err)
		os.Exit(1)
	}
}

func FormatResponse(greeting *Greeting) string {
	response := map[string]interface{}{
		"greeting": greeting.Greeting,
		"locale":   greeting.Locale,
	}
	jsonData, _ := json.Marshal(response)
	return string(jsonData)
}

func SelectGreeting(greetings []*Greeting, language string) (*Greeting, error) {
	if len(greetings) == 0 {
		return nil, errors.New("no greetings available")
	}

	if language == "random" {
		// Get random item from greetings slice
		randomIndex := rand.Intn(len(greetings))
		return greetings[randomIndex], nil
	}

	for _, greeting := range greetings {
		if greeting.Language == language {
			return greeting, nil
		}
	}

	return nil, fmt.Errorf("no greeting found for language '%s'", language)
}
