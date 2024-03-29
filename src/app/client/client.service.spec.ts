import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { ClientService } from './client.service';

const fakeClient = [
  {
    id: 1,
    name: 'client1',
    cpf: '10000000000'
  },
  {
    id: 2,
    name: 'client2',
    cpf: '20000000000'
  },
  {
    id: 3,
    name: 'client3',
    cpf: '30000000000'
  }
]

const prismMock = {
  client: {
    create: jest.fn().mockReturnValue(fakeClient[0]),
    findMany: jest.fn().mockResolvedValue(fakeClient),
    findFirst: jest.fn().mockResolvedValue(fakeClient[0]),
    findUniqueOrThrow: jest.fn().mockResolvedValue(fakeClient[0]),
    update: jest.fn().mockResolvedValue(fakeClient[0]),
    delete: jest.fn().mockReturnValue(undefined) // O método delete não retorna nada
  }
}

describe('ClientService', () => {
  let clientService: ClientService;
  let clientRepository: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService, 
        {provide: PrismaService, useValue: prismMock}],
    }).compile();

    clientService = module.get<ClientService>(ClientService);
    clientRepository = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(clientService).toBeDefined();
    expect(clientRepository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new client', async () => {
      //Arrange
      //Act
      const response = await clientService.create(fakeClient[0]);
      //Assert
      expect(response).toEqual(fakeClient[0]);
      expect(clientRepository.client.create).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if cpf is in use', () => {
      //Arrange
      jest.spyOn(clientRepository.client, 'create').mockRejectedValue(new Error());
      //Assert
      expect(clientService.create(fakeClient[5])).rejects.toThrowError();
    });
  });

  describe('findMany', () => {
    it(`should return an array of client`, async () => {
      //Act
      const response = await clientService.findAll();
      //Assert
      expect(response).toEqual(fakeClient);
      expect(clientRepository.client.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return error if it has an empty array', () => {
      //Arrange
      jest.spyOn(clientRepository.client, 'findMany').mockRejectedValue(new Error());
      //Act
      //Assert
      expect(clientService.findAll()).rejects.toThrowError(new NotFoundException());
    });
  });

  describe('findUniqueOrThrow', () => {
    it('Should return an unique client', async () => {
      //Arrange 
      //Act
      const response = await clientService.findOne(0); 
      //Assert
      expect(response).toEqual(fakeClient[0])
      expect(clientRepository.client.findUniqueOrThrow).toHaveBeenCalledTimes(1);
    });

    it('Should return an error if not found client', () => {
      //Arrange
      jest.spyOn(clientRepository.client, 'findUniqueOrThrow').mockRejectedValue(new Error());
      //Act
      //Assert
      expect(clientService.findOne(99)).rejects.toThrowError(new NotFoundException());
    });
  });

  describe('update', () => {
    it('Sould update a client', async () => {
      //Arrange
      //Act
      const response = await clientService.update(1, fakeClient[0]);
      //Assert
      expect(response).toEqual(fakeClient[0]);
      expect(clientRepository.client.update).toHaveBeenCalledTimes(1);
      expect(clientRepository.client.update).toHaveBeenCalledWith({
        where: {id: 1},
        data: fakeClient[0]
      });
    });

    it('should return NotFoundException when no client is found', async () => {
      //Arrange
      const unexistingClient = {
        id: 99,
        name: 'notfound',
        cpf: '11111111111'
      }
      jest.spyOn(clientRepository.client, 'update').mockRejectedValue(new Error());
      //Act
      //Assert
      try {
        await clientService.update(99, unexistingClient);
      } catch (error) {
        expect(error).toEqual(new NotFoundException());
      }
    });
  });

  describe('delete', () => {
    it('Should delete client and return empty body', async () => {
      //Arrange
      //Act
      //Assert
      expect(await clientService.remove(1)).toBeUndefined();
      expect(clientRepository.client.delete).toHaveBeenCalledTimes(1);
      expect(clientRepository.client.delete).toHaveBeenCalledWith({ where: {id: 1} });
    });

    it('Should return NotFoundException if client does not exist', async () => {
      //Arrange
      jest.spyOn(clientRepository.client, 'delete').mockRejectedValue(new Error());
      //Act
      //Assert
      try {
        await clientService.remove(99);
      } catch (error) {
        expect(error).toEqual(new NotFoundException());
      }
    });
  });
});
