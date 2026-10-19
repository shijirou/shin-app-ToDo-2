package com.example.taskboard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// リストの追加・名前変更で受け取るデータの形
public record ListRequest(
		@NotBlank(message = "リスト名を入力してください")
		@Size(max = 100, message = "リスト名は100文字以内で入力してください")
		String name) {

	// 受け取ったときに前後の空白（全角の空白も含む）を取り除く。入力チェックは取り除いたあとの値で行われる
	public ListRequest {
		name = name != null ? name.strip() : null;
	}
}
