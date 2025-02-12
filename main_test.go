package main_test

test main() {
	Marvin := Person{Name: "Marvin"}
	assert.Equal(t, fmt.Sprintf("Hello, %s!", Marvin.Name), "Hello Marvin!")
}
