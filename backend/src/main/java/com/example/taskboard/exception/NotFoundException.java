package com.example.taskboard.exception;

// 指定した番号のリストやカードが見つからないことを表すエラー
public class NotFoundException extends RuntimeException {

	// 例外クラスに付けておく決まりの番号（javac の警告 [serial] への対応）
	private static final long serialVersionUID = 1L;

	public NotFoundException(String message) {
		super(message);
	}
}
