import { CreateBoardDto } from '../../../../src/app/modules/boards/dtos/CreateBoard.dto';

describe('CreateBoardDto', () => {
  it('debería crear una instancia correctamente', () => {
    const dto = new CreateBoardDto();
    dto.name = 'Proyecto CRM';
    dto.description = 'Tablero principal del equipo de ventas';
    dto.memberIds = ['64a1b2c3d4e5f6a7b8c9d0e1', '75f2e3d4a1b2c3e4f5g6h7i8'];

    expect(dto).toBeInstanceOf(CreateBoardDto);
    expect(dto.name).toBe('Proyecto CRM');
    expect(dto.description).toBe('Tablero principal del equipo de ventas');
    expect(dto.memberIds).toEqual([
      '64a1b2c3d4e5f6a7b8c9d0e1',
      '75f2e3d4a1b2c3e4f5g6h7i8',
    ]);
  });

  it('debería permitir que la descripción sea opcional', () => {
    const dto = new CreateBoardDto();
    dto.name = 'Proyecto sin descripción';
    dto.memberIds = ['64a1b2c3d4e5f6a7b8c9d0e1'];

    expect(dto.description).toBeUndefined();
    expect(dto.name).toBe('Proyecto sin descripción');
    expect(dto.memberIds).toEqual(['64a1b2c3d4e5f6a7b8c9d0e1']);
  });

  it('debería tener las propiedades definidas correctamente', () => {
    const dto = new CreateBoardDto();
    const keys = Object.keys(dto);
    expect(keys).toEqual(expect.arrayContaining(['name', 'memberIds']));
  });

  it('debería asignar correctamente un arreglo de memberIds', () => {
    const dto = new CreateBoardDto();
    dto.memberIds = ['123', '456', '789'];
    expect(Array.isArray(dto.memberIds)).toBe(true);
    expect(dto.memberIds.length).toBe(3);
  });
});
