package com.example.taskboard.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

// カードの並び替え・移動で受け取るデータの形（移動先のリスト＋その中の何番目か。0 が先頭）
public record CardMoveRequest(
		@NotNull(message = "移動先のリストを指定してください")
		Long listId,
		@NotNull(message = "移動先の位置を指定してください")
		@Min(value = 0, message = "移動先の位置は0以上で指定してください")
		Integer position) {
}
