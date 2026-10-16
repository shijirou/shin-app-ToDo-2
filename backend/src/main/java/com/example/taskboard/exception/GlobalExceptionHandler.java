package com.example.taskboard.exception;

import org.springframework.beans.TypeMismatchException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.example.taskboard.dto.ErrorResponse;
import com.example.taskboard.entity.Priority;

import tools.jackson.databind.exc.InvalidFormatException;

// どの Controller でエラーが起きても、ここで受け止めて {"message":"…"} の同じ形の返事にする。
// Spring 標準の ResponseEntityExceptionHandler を土台にしているので、
// 入力チェック・形の誤り・ない URL（404）・使えないメソッド（405）なども、すべてこの形になる
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

	// 見つからないとき → 404
	@ExceptionHandler(NotFoundException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	public ErrorResponse handleNotFound(NotFoundException e) {
		return new ErrorResponse(e.getMessage());
	}

	// 予想していないエラー（DB が止まっているなど）→ 500。くわしい原因はログに出し、画面には出さない
	@ExceptionHandler(Exception.class)
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	public ErrorResponse handleUnexpected(Exception e) {
		logger.error("予想していないエラーが起きました", e);
		return new ErrorResponse("サーバーでエラーが起きました。しばらくしてからやり直してください");
	}

	// Spring が扱うエラーは、状態コード（400・404 など）はそのままで、返す本文だけをこの形に変える
	@Override
	protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body, HttpHeaders headers,
			HttpStatusCode statusCode, WebRequest request) {
		return super.handleExceptionInternal(ex, new ErrorResponse(messageFor(ex, statusCode)), headers, statusCode,
				request);
	}

	// エラーの種類ごとに、利用者に見せるメッセージを決める
	private String messageFor(Exception ex, HttpStatusCode statusCode) {
		// 入力チェック（@Valid）に引っかかった → DTO に書いたメッセージ
		if (ex instanceof MethodArgumentNotValidException e) {
			FieldError error = e.getBindingResult().getFieldError();
			return error != null ? error.getDefaultMessage() : "入力内容が正しくありません";
		}
		// URL の番号の形がちがう（例: /api/cards/abc）
		if (ex instanceof TypeMismatchException) {
			return "URL の番号の形が正しくありません（数字で指定してください）";
		}
		// 送られたデータ（JSON）が読めない。決まっていない重要度のときだけ、重要度の説明を出す
		if (ex instanceof HttpMessageNotReadableException e) {
			if (e.getMostSpecificCause() instanceof InvalidFormatException f && f.getTargetType() == Priority.class) {
				return "重要度は HIGH・MEDIUM・LOW のどれかで指定してください";
			}
			return "送られたデータの形が正しくありません";
		}
		if (statusCode.value() == HttpStatus.NOT_FOUND.value()) {
			return "その URL はありません";
		}
		if (statusCode.value() == HttpStatus.METHOD_NOT_ALLOWED.value()) {
			return "その URL では、この操作（メソッド）は使えません";
		}
		if (statusCode.value() == HttpStatus.UNSUPPORTED_MEDIA_TYPE.value()) {
			return "データは JSON（Content-Type: application/json）で送ってください";
		}
		return "リクエストを処理できませんでした（" + statusCode.value() + "）";
	}
}
