import { useRouter } from 'next/router';
import { usePostQuery } from '../generated/graphql';
import { useGetIntId } from './use-get-int-id';

export const useGetPostFromUrl = () => {
    const intId =  useGetIntId();
    return usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId,
        },
    });
}

