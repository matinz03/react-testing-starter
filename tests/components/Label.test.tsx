import { render, screen } from "@testing-library/react";
import Label from "../../src/components/Label";
import { LanguageProvider } from "../../src/providers/language/LanguageProvider";
import { Language } from "../../src/providers/language/type";
describe("Label", () => {
  const renderComponent = (label: string, language: Language) => {
    render(
      <LanguageProvider language={language}>
        <Label labelId={label} />
      </LanguageProvider>
    );
  };
  describe("Language EN", () => {
    it.each([
      { labelId: "welcome", text: "Welcome" },
      { labelId: "new_product", text: "New Product" },
      { labelId: "edit_product", text: "Edit Product" },
    ])("should render $labelId with $text in English ", ({ labelId, text }) => {
      renderComponent(labelId, "en");
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });
  describe("Language ES", () => {
    it.each([
      { labelId: "welcome", text: "Bienvenidos" },
      { labelId: "new_product", text: "Nuevo Producto" },
      { labelId: "edit_product", text: "Editar Producto" },
    ])("should render $labelId with $text in Spanish ", ({ labelId, text }) => {
      renderComponent(labelId, "es");
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });
 
});
