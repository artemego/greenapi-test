import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  GreenApiCredentials,
  InstanceState,
} from '../green-api/green-api.types.js';
import { Instance } from './instance.entity.js';

@Injectable()
export class InstancesService {
  constructor(
    @InjectRepository(Instance) private readonly repo: Repository<Instance>,
  ) {}

  /** Creates the instance or refreshes its token, URL and state. Returns it without the token. */
  async upsertByIdInstance(
    creds: GreenApiCredentials,
    state: InstanceState,
  ): Promise<Instance> {
    await this.repo.upsert(
      {
        idInstance: creds.idInstance,
        apiTokenInstance: creds.apiTokenInstance,
        apiUrl: creds.apiUrl,
        state,
      },
      { conflictPaths: ['idInstance'] },
    );
    return this.repo.findOneByOrFail({ idInstance: creds.idInstance });
  }

  findById(id: string): Promise<Instance | null> {
    return this.repo.findOneBy({ id });
  }

  /** Credentials for calling GREEN-API on behalf of an instance (the only read that loads the token). */
  async findWithToken(id: string): Promise<GreenApiCredentials | null> {
    const row = await this.repo.findOne({
      where: { id },
      select: { id: true, idInstance: true, apiUrl: true, apiTokenInstance: true },
    });
    return row
      ? {
          apiUrl: row.apiUrl,
          idInstance: row.idInstance,
          apiTokenInstance: row.apiTokenInstance,
        }
      : null;
  }

  async setState(id: string, state: InstanceState): Promise<void> {
    await this.repo.update({ id }, { state });
  }
}
