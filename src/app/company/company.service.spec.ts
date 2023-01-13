import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { CompanyService } from './company.service';

const fakeCompany = [
  {
    id: 1,
    name: 'empresa1',
    cnpj: '10000000000000'
  },
  {
    id: 2,
    name: 'empresa2',
    cnpj: '20000000000000'
  },
  {
    id: 3,
    name: 'empresa3',
    cnpj: '30000000000000'
  }
]

const primsMock = {
  company: {
    create: jest.fn().mockReturnValue(fakeCompany[0]),
    findMany: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
};

describe('CompanyService', () => {
  let companyService: CompanyService;
  let companyRepositoy: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {provide: PrismaService, useValue: primsMock}
      ],
    }).compile();

    companyService = module.get<CompanyService>(CompanyService);
    companyRepositoy = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(companyService).toBeDefined();
    expect(companyRepositoy).toBeDefined();
  });

  describe('create', () => {
    it('Should create a new client', async () => {
      //Arrange
      //Act
      const response = await companyService.create(fakeCompany[0]);
      //Assert
      expect(response).toEqual(fakeCompany[0]);
      expect(companyRepositoy.company.create).toHaveBeenCalledTimes(1);
      expect(companyRepositoy.company.create).toHaveBeenCalledWith({
        data: fakeCompany[0]
      });
    });
  });
});
