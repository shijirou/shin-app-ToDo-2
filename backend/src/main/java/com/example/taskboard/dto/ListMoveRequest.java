package com.example.taskboard.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

// リストの並び替えで受け取るデータの形（左から何番目に置くか。0 が左端）
public record ListMoveRequest(
		@NotNull(message = "移動先の位置を指定してください")
		@Min(value = 0, message = "移動先の位置は0以上で指定してください")
		Integer position) {
}
