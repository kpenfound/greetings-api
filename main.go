package main

import (
	"errors"
	"fmt"
	"net/http"
	"os"

	"github.com/rs/cors"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("got / request from %s\n", r.RemoteAddr)
		w.Header().Set("Content-Type", "application/json")
		_, err := w.Write([]byte(greeting()))
		if err != nil {
			panic(err)
		}
	})

	mux.HandleFunc("/french", func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("got /french request from %s\n", r.RemoteAddr)
		w.Header().Set("Content-Type", "application/json")
		_, err := w.Write([]byte(frenchGreeting()))
		if err != nil {
			panic(err)
		}
	})

	mux.HandleFunc("/italian-greeting", func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("got /italian-greeting request from %s\n", r.RemoteAddr)
		w.Header().Set("Content-Type", "application/json")
		_, err := w.Write([]byte(greetingItalian()))

		if err != nil {
			panic(err)
		}
	})

	c := cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://greetings.kylepenfound.com",
			"https://dagger-demo.netlify.app",
			"http://localhost:8081",
			"http://localhost:1313",
		},
		// Enable Debugging for testing, consider disabling in production
		Debug: true,
	})
	handler := c.Handler(mux)
	err := http.ListenAndServe(":8080", handler)
	if errors.Is(err, http.ErrServerClosed) {
		fmt.Printf("server closed\n")
	} else if err != nil {
		fmt.Printf("error starting server: %s\n", err)
		os.Exit(1)
	}
}

func greeting() string {
	greeting := "Greetings Daggernauts!"
	return fmt.Sprintf("{\"greeting\":\"%s\"}", greeting)
}

func frenchGreeting() string {
	frenchGreeting := "Salutations Daggernauts !"
	return fmt.Sprintf("{\"greeting\":\"%s\"}", frenchGreeting)
}

func greetingItalian() string {
	greeting := "Saluti, Daggnauti!"
	return fmt.Sprintf("{\"greeting\":\"%s\"}", greeting)
}
