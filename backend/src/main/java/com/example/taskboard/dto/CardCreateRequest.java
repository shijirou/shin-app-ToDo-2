package com.example.taskboard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// カードの追加で受け取るデータの形（どのリストに入れるか＋内容）
public record CardCreateRequest(
		@NotNull(message = "追加先のリストを指定してください")
		Long listId,
		@NotBlank(message = "カードの内容を入力してください")
		String content) {
}
