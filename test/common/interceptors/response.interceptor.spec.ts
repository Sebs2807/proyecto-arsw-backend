// test/common/interceptors/response.interceptor.spec.ts
import { ResponseInterceptor } from '../../../src/common/interceptors/response.interceptor';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;
  let mockExecutionContext: Partial<ExecutionContext>;
  let mockCallHandler: Partial<CallHandler>;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
    mockExecutionContext = {};
    mockCallHandler = {};
  });

  it('debería envolver correctamente la respuesta cuando data es un objeto simple', (done) => {
    const testData = { id: 1, name: 'Test' };
    mockCallHandler.handle = jest.fn(() => of(testData));

    interceptor.intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
      .subscribe((result) => {
        expect(result).toEqual({
          status: 'success',
          message: 'Operación exitosa',
          data: testData,
        });
        done();
      });
  });

  it('debería mantener el formato si data tiene propiedad message o meta', (done) => {
    const testData = { message: 'Datos obtenidos correctamente', meta: { total: 5 } };
    mockCallHandler.handle = jest.fn(() => of(testData));

    interceptor.intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
      .subscribe((result) => {
        expect(result).toEqual({
          status: 'success',
          message: 'Datos obtenidos correctamente',
          data: testData,
        });
        done();
      });
  });

  it('debería lanzar el error cuando ocurre un error en el flujo', (done) => {
    const testError = new Error('Algo salió mal');
    mockCallHandler.handle = jest.fn(() => throwError(() => testError));

    const observable = interceptor.intercept(
      mockExecutionContext as ExecutionContext,
      mockCallHandler as CallHandler,
    );

    observable.subscribe({
      next: () => fail('No debería emitir un valor'),
      error: (err) => {
        expect(err).toBe(testError);
        done();
      },
    });
  });
});
