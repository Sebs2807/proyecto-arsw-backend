// test/common/filters/http-exception.filter.spec.ts
import { AllExceptionsFilter } from '../../../src/common/filters/http-interceptor.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockHost: Partial<ArgumentsHost>;

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      url: '/test-endpoint',
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };
  });

  it('debería manejar HttpException correctamente', () => {
    const exception = new HttpException('Recurso no encontrado', HttpStatus.NOT_FOUND);
    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Recurso no encontrado',
        path: '/test-endpoint',
      }),
    );
  });

  it('debería manejar errores genéricos como error interno del servidor', () => {
    const exception = new Error('Fallo inesperado');
    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Error interno del servidor',
        path: '/test-endpoint',
      }),
    );
  });

  it('debería manejar HttpException con objeto de respuesta personalizado', () => {
    const exception = new HttpException(
      { message: 'Datos inválidos', error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );
    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Datos inválidos',
        path: '/test-endpoint',
      }),
    );
  });
});
