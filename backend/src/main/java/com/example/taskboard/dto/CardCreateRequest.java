package com.example.taskboard.dto;

import com.example.taskboard.entity.Priority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// カードの追加で受け取るデータの形（どのリストに入れるか＋内容＋重要度）
// 重要度は送らなくてもよい（送らなければ「中」になる）
public record CardCreateRequest(
		@NotNull(message = "追加先のリストを指定してください")
		Long listId,
		@NotBlank(message = "カードの内容を入力してください")
		String content,
		Priority priority) {
}
