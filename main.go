package main

import (
	"fmt"
)

type Person struct {
	Name string
}

func main() {
	var Marvin = Person{Name: "Marvin"}
	 fmt.Println("Hello, " + Marvin.Name + "!")
}
