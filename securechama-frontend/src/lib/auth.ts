import { jwtDecode } from "jwt-decode";

type TokenPayload = {
	exp?: number;
};

function cookieMaxAgeFromToken(token: string): number {
	try {
		const decoded = jwtDecode<TokenPayload>(token);
		if (!decoded.exp) return 60 * 60;

		const nowSeconds = Math.floor(Date.now() / 1000);
		return Math.max(decoded.exp - nowSeconds, 1);
	} catch {
		return 60 * 60;
	}
}

export function setAuthCookies(access: string, refresh?: string) {
	const accessMaxAge = cookieMaxAgeFromToken(access);
	document.cookie = `access=${encodeURIComponent(access)}; Path=/; Max-Age=${accessMaxAge}; SameSite=Lax`;

	if (refresh) {
		document.cookie = `refresh=${encodeURIComponent(refresh)}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`;
	}
}

export function clearAuthCookies() {
	document.cookie = "access=; Path=/; Max-Age=0; SameSite=Lax";
	document.cookie = "refresh=; Path=/; Max-Age=0; SameSite=Lax";
}
