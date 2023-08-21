import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { User } from '../entities/user.entity';
import { CreateReservationDto } from './dto/create.reservation.dto';

describe('ReservationsController', () => {
  let reservationsController: ReservationsController;

  const mockReservationsService = {
    createReservation: jest.fn(),
    getMyReservation: jest.fn(),
    deleteReservation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        { provide: ReservationsService, useValue: mockReservationsService },
      ],
    }).compile();

    reservationsController = module.get<ReservationsController>(
      ReservationsController,
    );
  });

  it('should be defined', () => {
    expect(reservationsController).toBeDefined();
  });

  describe('createReservation', () => {
    it('createReservation success case', async () => {
      const user = new User();
      user.id = expect.any(Number);

      const id = expect.any(Number);

      const createReservationDto: CreateReservationDto = {
        check_in: expect.any(String),
        check_out: expect.any(String),
      };

      mockReservationsService.createReservation.mockResolvedValue(
        'create result',
      );

      const result = await reservationsController.createReservation(
        user,
        id,
        createReservationDto,
      );

      expect(result).toEqual('create result');
      expect(mockReservationsService.createReservation).toBeCalledWith({
        userId: user.id,
        houseId: id,
        ...createReservationDto,
      });
      expect(mockReservationsService.createReservation).toBeCalledTimes(1);
    });
  });

  describe('getMyReservation', () => {
    it('getMyReservation success case', async () => {
      const user = new User();
      user.id = expect.any(Number);

      mockReservationsService.getMyReservation.mockResolvedValue(
        'getMyReservation result',
      );

      const result = await reservationsController.getMyReservation(user);

      expect(result).toEqual('getMyReservation result');
      expect(mockReservationsService.getMyReservation).toBeCalledTimes(1);
      expect(mockReservationsService.getMyReservation).toBeCalledWith(user.id);
    });
  });

  describe('deleteReservation', () => {
    it('deleteReservation success case', async () => {
      const user = new User();
      user.id = expect.any(Number);

      const id = expect.any(Number);

      mockReservationsService.deleteReservation.mockResolvedValue(
        'delete result',
      );

      const result = await reservationsController.deleteReservation(user, id);

      expect(result).toEqual('delete result');
      expect(mockReservationsService.deleteReservation).toBeCalledTimes(1);
      expect(mockReservationsService.deleteReservation).toBeCalledWith(
        id,
        user.id,
      );
    });
  });
});
