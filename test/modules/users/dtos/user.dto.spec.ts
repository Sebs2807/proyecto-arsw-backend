// test/modules/users/dtos/user.dto.spec.ts

import { plainToInstance, instanceToPlain } from 'class-transformer';
import { UserDto } from 'src/app/modules/users/dtos/user.dto';

describe('UserDto', () => {
  it('debería crear una instancia correctamente', () => {
    const user = new UserDto();
    user.id = 'a1b2c3';
    user.firstName = 'John';
    user.lastName = 'Doe';
    user.email = 'john.doe@example.com';
    user.picture = 'https://example.com/avatar.jpg';
    user.role = 'ADMIN';
    user.createdAt = new Date();
    user.updatedAt = new Date();

    expect(user).toBeInstanceOf(UserDto);
    expect(user.firstName).toBe('John');
    expect(user.lastName).toBe('Doe');
    expect(user.email).toBe('john.doe@example.com');
  });

  it('debería permitir que picture y JWTRefreshToken sean opcionales', () => {
    const user = new UserDto();
    user.id = '123';
    user.firstName = 'Jane';
    user.lastName = 'Smith';
    user.email = 'jane@example.com';
    user.role = 'USER';
    user.createdAt = new Date();
    user.updatedAt = new Date();

    expect(user.picture).toBeUndefined();
    expect(user.JWTRefreshToken).toBeUndefined();
  });

  it('debería exponer solo las propiedades marcadas con @Expose()', () => {
    const user = plainToInstance(UserDto, {
      id: '1',
      firstName: 'Ana',
      lastName: 'Pérez',
      email: 'ana@example.com',
      picture: 'https://cdn.img',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
      googleRefreshToken: 'secret1',
      JWTRefreshToken: 'secret2',
    });

    const plain = instanceToPlain(user);

    expect(plain).toHaveProperty('id');
    expect(plain).toHaveProperty('firstName');
    expect(plain).toHaveProperty('lastName');
    expect(plain).toHaveProperty('email');
    expect(plain).toHaveProperty('role');
    expect(plain).toHaveProperty('createdAt');
    expect(plain).toHaveProperty('updatedAt');

    expect(plain).not.toHaveProperty('googleRefreshToken');
    expect(plain).not.toHaveProperty('JWTRefreshToken');
  });

  it('debería transformar correctamente desde un objeto plano', () => {
    const plainUser = {
      id: 'abc123',
      firstName: 'Carlos',
      lastName: 'Gómez',
      email: 'carlos@example.com',
      role: 'USER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const user = plainToInstance(UserDto, plainUser);

    expect(user).toBeInstanceOf(UserDto);
    expect(user.firstName).toBe('Carlos');
    expect(user.email).toBe('carlos@example.com');
    expect(user.role).toBe('USER');
  });
});
