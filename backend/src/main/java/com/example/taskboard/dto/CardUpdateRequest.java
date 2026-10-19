package com.example.taskboard.dto;

import com.example.taskboard.entity.Priority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// カードの内容・重要度の変更で受け取るデータの形
// 重要度は送らなくてもよい（送らなければ今のまま）
public record CardUpdateRequest(
		@NotBlank(message = "カードの内容を入力してください")
		@Size(max = 1000, message = "カードの内容は1000文字以内で入力してください")
		String content,
		Priority priority) {

	// 受け取ったときに前後の空白・改行（全角の空白も含む）を取り除く
	public CardUpdateRequest {
		content = content != null ? content.strip() : null;
	}
}
