package com.example.taskboard.dto;

import jakarta.validation.constraints.NotBlank;

// カードの内容変更で受け取るデータの形
public record CardUpdateRequest(
		@NotBlank(message = "カードの内容を入力してください")
		String content) {
}
