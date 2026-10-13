package com.example.taskboard.exception;

// 指定した番号のリストやカードが見つからないことを表すエラー
public class NotFoundException extends RuntimeException {

	public NotFoundException(String message) {
		super(message);
	}
}
