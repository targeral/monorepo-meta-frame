package main

import (
	"fmt"

	"github.com/kirinlabs/HttpRequest"
)

func loop() {
	for i := 0; i < 10; i++ {
		fmt.Printf("%d ", i)
	}
}

type result struct {
	Args    string            `json:"args"`
	Headers map[string]string `json:"headers"`
	Origin  string            `json:"origin"`
	Url     string            `json:"url"`
}

func main() {
	req := HttpRequest.NewRequest()
	res, _ := req.Get("https://registry.npmjs.org/@modern-js/utils")
	var m map[string]interface{}
	body := res.Json(&m)
	fmt.Println(body)
}
