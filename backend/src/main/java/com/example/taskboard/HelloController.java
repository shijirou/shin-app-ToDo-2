package com.example.taskboard;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// 動作確認用（環境ができたことを確かめるためのもの。後で削除してよい）
@RestController
public class HelloController {

	@GetMapping("/api/hello")
	public String hello() {
		return "Hello, Spring Boot!";
	}
}
