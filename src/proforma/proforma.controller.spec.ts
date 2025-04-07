import { Test, TestingModule } from '@nestjs/testing';
import { ProformaController } from './proforma.controller';

describe('ProformaController', () => {
  let controller: ProformaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProformaController],
    }).compile();

    controller = module.get<ProformaController>(ProformaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
