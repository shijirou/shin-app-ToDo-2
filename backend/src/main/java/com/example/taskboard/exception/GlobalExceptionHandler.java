package com.example.taskboard.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.taskboard.dto.ErrorResponse;

// どの Controller でエラーが起きても、ここで受け止めて同じ形の返事にする
@RestControllerAdvice
public class GlobalExceptionHandler {

	// 見つからないとき → 404
	@ExceptionHandler(NotFoundException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	public ErrorResponse handleNotFound(NotFoundException e) {
		return new ErrorResponse(e.getMessage());
	}

	// 入力チェック（@Valid）に引っかかったとき → 400
	@ExceptionHandler(MethodArgumentNotValidException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ErrorResponse handleValidation(MethodArgumentNotValidException e) {
		String message = e.getBindingResult().getFieldErrors().get(0).getDefaultMessage();
		return new ErrorResponse(message);
	}

	// 送られたデータの形が正しくないとき（決まっていない重要度など）→ 400
	@ExceptionHandler(HttpMessageNotReadableException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ErrorResponse handleNotReadable(HttpMessageNotReadableException e) {
		return new ErrorResponse("送られたデータの形が正しくありません（重要度は HIGH・MEDIUM・LOW のどれか）");
	}
}
