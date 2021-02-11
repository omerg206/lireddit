import { Updoot } from './../entities/updoot';
import DataLoader from "dataloader";
import { User } from '../entities/user';

export const createUpdootLoader = () => new DataLoader<{ postId: number, userId: number }, Updoot | null>(
    async (keys) => {


    const users = await Updoot.findByIds(keys as any);
    const updootIdsToUpdoot: Record<string, Updoot> = {};
    users.forEach(updoot => {
        updootIdsToUpdoot[`${updoot.userId}|${updoot.postId}`] = updoot;
    });

    return keys.map((key) => updootIdsToUpdoot[`${key.userId}|${key.postId}`]);
});