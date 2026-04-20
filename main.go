package main

import (
	_ "embed"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

//go:embed greetings.json
var greetingsJson []byte

type Greeting struct {
	Language string `json:"language"`
	Greeting string `json:"greeting"`
}

func AuthMiddleware(apiKey string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		authHeaderParts := strings.Split(authHeader, " ")
		if len(authHeaderParts) != 2 || strings.ToLower(authHeaderParts[0]) != "bearer" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		token := authHeaderParts[1]
		if token != apiKey {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	}
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
		}
		_, err = w.Write([]byte(FormatResponse(greeting)))
		if err != nil {
			panic(err)
		}
	}).Methods("GET")

	router.HandleFunc("/greetings", AuthMiddleware(os.Getenv("ADMIN_API_KEY"), func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var newGreeting Greeting
		err := json.NewDecoder(r.Body).Decode(&newGreeting)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		greetings = append(greetings, &newGreeting)

		w.WriteHeader(http.StatusCreated)
		_, err = fmt.Fprintf(w, "Greeting added successfully")
		if err != nil {
			http.Error(w, "Failed to write response", http.StatusInternalServerError)
			return
		}
	})).Methods("POST")

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
	return fmt.Sprintf("{\"greeting\":\"%s\"}", greeting.Greeting)
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
