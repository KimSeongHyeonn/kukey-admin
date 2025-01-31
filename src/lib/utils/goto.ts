import { goto } from '$app/navigation';
import { base } from '$app/paths';

export const gotoWithBase = (href: string) => {
	goto(`${base}${href}`);
};
