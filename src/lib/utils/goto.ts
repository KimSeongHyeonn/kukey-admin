import { goto } from '$app/navigation';
import { base } from '$app/paths';

// Deprecated: 도메인을 설정함으로써 더이상 base 사용하지 않게 변경
export const gotoWithBase = (href: string) => {
	goto(`${base}${href}`);
};
