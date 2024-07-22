import React, { useEffect, useRef, useState } from "react";
import Styles from "./Textedit.module.css";

const Textedit = () => {
  const editorRef = useRef(null);
  const [fontStylesData, setFontStylesData] = useState({});
  const [fontStylesTypes, setFontStylesTypes] = useState([]);
  const [selectedFont, setSelectedFont] = useState("");
  const [allVarients, setAllVarients] = useState([]);
  const [selectedVarient, setSelectedVarient] = useState("");
  const [isToggled, setIsToggled] = useState(false);
  const [isToggleEnabled, setIsToggleEnabled] = useState(false);

  const handleToggle = () => {
    if (isToggleEnabled) {
      const newVarient = isToggled
        ? allVarients.find((e) => !e.endsWith("italic"))
        : allVarients.find((e) => e.endsWith("italic"));

      if (newVarient) {
        setSelectedVarient(newVarient);
        localStorage.setItem("selectedVarient", newVarient);
      }
      setIsToggled(!isToggled);
    }
  };

  const customFontStyle =
    fontStylesTypes.length > 0 &&
    selectedVarient &&
    selectedFont &&
    `
    @font-face {
      font-family: '${selectedFont}';
      src: url(${fontStylesData[selectedFont][selectedVarient]}) format('woff2');
      font-weight: ${selectedVarient.includes("italic") ? "normal" : selectedVarient};
      font-style: ${selectedVarient.includes("italic") ? "italic" : "normal"};
    }
  `;

  const getFontStyle = async () => {
    try {
      const response = await fetch("/punt-frontend-assignment (1).json");
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const fontData = await response.json();
      const allStylesFamilyType = Object.keys(fontData);
      const storedFont = localStorage.getItem("selectedFont");
      const storedVarient = localStorage.getItem("selectedVarient");

      if (storedFont && fontData[storedFont]) {
        const allVarients = Object.keys(fontData[storedFont]);
        setIsToggleEnabled(allVarients.some((e) => e.endsWith("italic")));
        setAllVarients(allVarients);
      }

      setFontStylesData(fontData);
      setFontStylesTypes(allStylesFamilyType);

      if (storedFont && storedVarient) {
        setSelectedFont(storedFont);
        setSelectedVarient(storedVarient);
      }
    } catch (error) {
      console.error('Error fetching font data:', error);
    }
  };

  useEffect(() => {
    getFontStyle();
  }, []);

  const handleSelectFont = (styleKey) => {
    setSelectedFont(styleKey);
    if (styleKey && fontStylesData[styleKey]) {
      const allVarients = Object.keys(fontStylesData[styleKey]);
      const isToggleEnabled = allVarients.some((e) => e.endsWith("italic"));
      setIsToggleEnabled(isToggleEnabled);
      setAllVarients(allVarients);
      const defaultVarient = allVarients[0];
      setSelectedVarient(defaultVarient);
      localStorage.setItem("selectedFont", styleKey);
      localStorage.setItem("selectedVarient", defaultVarient);
    } else {
      setAllVarients([]);
    }
  };

  const handleVarient = (varient) => {
    setIsToggled(varient.endsWith("italic"));
    localStorage.setItem("selectedVarient", varient);
    setSelectedVarient(varient);
  };

  useEffect(() => {
    if (editorRef.current && selectedFont && selectedVarient) {
      editorRef.current.style.fontFamily = `${selectedFont}, sans-serif`;
    }
  }, [selectedFont, selectedVarient]);

  useEffect(() => {
    const handleInput = () => {
      if (editorRef.current) {
        localStorage.setItem("content", editorRef.current.innerText);
      }
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener("input", handleInput);
    }
    return () => {
      if (editor) {
        editor.removeEventListener("input", handleInput);
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.textContent = localStorage.getItem("content") || "";
    }
    if (!selectedFont || !selectedVarient) {
      const storedVarient = localStorage.getItem("selectedVarient");
      if (storedVarient?.endsWith("italic")) {
        setIsToggled(true);
      }
      setSelectedFont(localStorage.getItem("selectedFont") || "");
      setSelectedVarient(storedVarient || "");
    }
  }, []);

  const handleReset = () => {
    if (editorRef.current) {
      editorRef.current.textContent = "";
    }
    setIsToggled(false);
    setSelectedFont("");
    setSelectedVarient("");
    localStorage.setItem("content", "");
    localStorage.setItem("selectedFont", "");
    localStorage.setItem("selectedVarient", "");
  };

  const handleAdd = () => {
    localStorage.setItem("selectedFont", selectedFont);
    localStorage.setItem("selectedVarient", selectedVarient);
  };

  return (
    <div>
      <style>{customFontStyle}</style>
      <h1 className={Styles.textEditorHeading}>Text Editor</h1>
      <div>
        <div className={Styles.selectorDivWrapper}>
          <div className={Styles.selectorDiv}>
            <span>Font Family</span>
            <select
              value={selectedFont}
              onChange={(e) => handleSelectFont(e.target.value)}
            >
              <option value="">Select Font Type</option>
              {fontStylesTypes.map((ele, index) => (
                <option value={ele} key={index}>
                  {ele}
                </option>
              ))}
            </select>
          </div>
          <div className={Styles.selectorDiv}>
            <span>Varient</span>
            <select
              value={selectedVarient}
              onChange={(e) => handleVarient(e.target.value)}
              disabled={!selectedFont}
            >
              {selectedFont === "" && <option value={""}>Select Varient</option>}
              {allVarients.map((ele, index) => (
                <option value={ele} key={index}>
                  {ele}
                </option>
              ))}
            </select>
          </div>
          <div className={Styles.toggleSwitch} onClick={handleToggle}>
            <div
              style={{
                backgroundColor: isToggleEnabled ? "" : "rgb(230, 223, 223)",
              }}
              className={`${Styles.switch} ${
                isToggled ? Styles.on : Styles.off
              }`}
            ></div>
          </div>
        </div>
        <div ref={editorRef} contentEditable className={Styles.editor} />
      </div>
      <div className={Styles.bottomButtons}>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleAdd}>Save</button>
      </div>
    </div>
  );
};

export default Textedit;
