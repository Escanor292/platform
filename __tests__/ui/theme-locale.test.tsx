import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "next-themes";
import { LocaleProvider, translate, useI18n } from "@/i18n";
import ThemeToggle from "@/components/layout/ThemeToggle";
import LocaleToggle from "@/components/layout/LocaleToggle";
import { THEME_STORAGE_KEY, LOCALE_STORAGE_KEY } from "@/lib/preferences";

function wrap(ui: React.ReactNode) {
  return render(
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey={THEME_STORAGE_KEY}>
      <LocaleProvider>{ui}</LocaleProvider>
    </ThemeProvider>
  );
}

function HomeLabel() {
  const { t } = useI18n();
  return <span data-testid="home-label">{t("nav.home")}</span>;
}

describe("theme + locale chrome", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.lang = "vi";
    window.localStorage.clear();
    document.cookie = `${THEME_STORAGE_KEY}=; Path=/; Max-Age=0`;
    document.cookie = `${LOCALE_STORAGE_KEY}=; Path=/; Max-Age=0`;
  });

  test("toggle theme adds and removes dark class on documentElement", async () => {
    const user = userEvent.setup();
    wrap(<ThemeToggle />);

    const darkBtn = await screen.findByRole("button", { name: /chế độ tối|dark mode/i });
    await user.click(darkBtn);

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    const lightBtn = screen.getByRole("button", { name: /chế độ sáng|light mode/i });
    await user.click(lightBtn);

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  test("toggle locale switches nav.home Trang chủ ↔ Home", async () => {
    const user = userEvent.setup();
    wrap(
      <>
        <LocaleToggle />
        <HomeLabel />
      </>
    );

    expect(screen.getByTestId("home-label")).toHaveTextContent("Trang chủ");
    expect(translate("vi", "nav.home")).toBe("Trang chủ");
    expect(translate("en", "nav.home")).toBe("Home");
    expect(translate("vi", "brand.name")).toBe("TửTế Fund");
    expect(translate("en", "brand.name")).toBe("TuTe Fund");
    expect(translate("en", "catalog.exploreTitle2")).toBe("campaigns");
    expect(translate("en", "cat.tech")).toBe("Technology");
    expect(translate("vi", "catalog.showing", { start: 1, end: 10, total: 10 })).toBe(
      "Hiển thị 1-10 trong tổng số 10 chiến dịch",
    );
    expect(translate("en", "catalog.showing", { start: 1, end: 10, total: 10 })).toBe(
      "Showing 1-10 of 10 campaigns",
    );

    await user.click(screen.getByRole("button", { name: /switch to english/i }));
    await waitFor(() => {
      expect(screen.getByTestId("home-label")).toHaveTextContent("Home");
    });

    await user.click(screen.getByRole("button", { name: /tiếng việt/i }));
    await waitFor(() => {
      expect(screen.getByTestId("home-label")).toHaveTextContent("Trang chủ");
    });
  });
});
