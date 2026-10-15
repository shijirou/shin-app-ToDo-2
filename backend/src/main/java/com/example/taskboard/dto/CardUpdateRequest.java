package com.example.taskboard.dto;

import com.example.taskboard.entity.Priority;

import jakarta.validation.constraints.NotBlank;

// カードの内容・重要度の変更で受け取るデータの形
// 重要度は送らなくてもよい（送らなければ今のまま）
public record CardUpdateRequest(
		@NotBlank(message = "カードの内容を入力してください")
		String content,
		Priority priority) {
}
