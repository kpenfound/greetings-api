package main

import (
	"fmt"
	"net/http"

	log "github.com/sirupsen/logrus"
	"github.com/gorilla/mux"
)

func englishGreeting(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, World!")
}

func frenchGreeting(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Bonjour, le monde!")
}

func spanishGreeting(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "¡Hola, Mundo!")
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/greet/en", englishGreeting).Methods("GET")
	r.HandleFunc("/greet/fr", frenchGreeting).Methods("GET")
	r.HandleFunc("/greet/es", spanishGreeting).Methods("GET")

	fmt.Println("Starting server at port 8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal(err)
	}
}