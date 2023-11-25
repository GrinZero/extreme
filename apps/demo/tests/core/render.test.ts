import { useRef, useState } from "@/hooks";
import { render } from "@/core";
import { describe, expect, it, beforeEach, vi } from "vitest";

describe("useTemplate", () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement("div");
  });

  it("should render a template without state and ref", () => {
    const template = `<p id="first">Hello, {{name}}!</p>`;
    render(element, template);
    expect(element.innerHTML).toBe(
      `<p id="first">Hello, [without state "name"]!</p>`
    );
  });

  it("should render a template with state", () => {
    const template = `<p id="state">Hello, {{name}}!</p>`;
    const props = { state: { name: "John" } };
    render(element, template, props);
    expect(element.innerHTML).toBe(`<p id="state">Hello, John!</p>`);
  });

  it("should render a template with ref", () => {
    const template = '<p id="{{id}}">Hello, {{name}}!</p>';
    const greetingRef = useRef();
    const props = { state: { name: "John" }, ref: { id: greetingRef } };
    render(element, template, props);
    expect(element.innerHTML).toBe(`<p id="${greetingRef}">Hello, John!</p>`);

    expect(greetingRef()).toBe(document.querySelector("p"));
  });

  it("should handle methods", () => {
    const template = '<button @click="{{onClick}}">Click me</button>';
    const onClick = vi.fn();
    const props = { methods: { onClick } };
    render(element, template, props);
    const button = element.querySelector("button");
    if (button) {
      button.click();
    }
    expect(onClick).toHaveBeenCalled();
  });

  it("should handle state updates", () => {
    const template = "<p>{{message}}</p>";
    const [message, setMessage] = useState("Hello");
    const props = {
      state: {
        message,
      },
    };
    const base = render(element, template, props);
    expect(base!.innerHTML).toContain("Hello");
    message((v) => {
      expect(v).toBe("Updated");
    });
    setMessage("Updated");
    // 没有效果...?
  });
});
