// Landing.js

import React, { useEffect, useState } from "react";
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { classnames } from "./utils/general";
import { languageOptions } from "./constants/LanguageOptions";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { defineTheme } from "./lib/defineTheme";
import useKeyPress from "./hooks/useKeyPress";
import OutputWindow from "./components/OutputWindow";
import CustomInput from "./components/CustomInput";
import OutputDetails from "./components/OutputDetails";
import ThemeDropdown from "./components/ThemeDropdown";
import LanguagesDropdown from "./components/LanguagesDropdown";
import SpeechRecognitionComponent from "./components/speechRecognition";

const javascriptDefault = `console.log('hello');`;
const blankTranscript = '';

// make sure the recorded text is referenced to send to the api
// make sure the response is pasted in the code box
// styling

const Landing = () => {
  const [code, setCode] = useState(javascriptDefault);
  const [transcript, setTranscript] = useState(blankTranscript)
  const [customInput, setCustomInput] = useState("");
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [theme, setTheme] = useState("cobalt");
  const [language, setLanguage] = useState(languageOptions[0]);

  const enterPress = useKeyPress("Enter");
  const ctrlPress = useKeyPress("Control");

  const onSelectChange = (sl) => {
    console.log("selected Option...", sl);
    setLanguage(sl);
  };

  function handleThemeChange(th) {
    const theme = th;
    console.log("theme...", theme);

    if (["light", "vs-dark"].includes(theme.value)) {
      setTheme(theme);
    } else {
      defineTheme(theme.value).then((_) => setTheme(theme));
    }
  }

  useEffect(() => {
    if (enterPress && ctrlPress) {
      console.log("enterPress", enterPress);
      console.log("ctrlPress", ctrlPress);
      handleCompile();
    }
  }, [ctrlPress, enterPress]);
  const onChange = (action, data) => {
    switch (action) {
      case "code": {
        setCode(data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };

  // HANDLE THE COMPILATION (SEND THE CODE IN THE CodeEditorWindow to Judge0) --------
  const handleCompile = () => {
    // We will come to the implementation later in the code
    setProcessing(true);
    const formData = {
      language_id: language.id,
      // encode source code in base64
      source_code: btoa(code),
      stdin: customInput,
    };
    const options = {
      method: "POST",
      url: "https://judge0-ce.p.rapidapi.com/submissions",
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        "X-RapidAPI-Key": "1c7fa412b9mshc09cfdc0adff1f5p11c09ejsn7c9c8243205f",
      },
      data: formData,
    };

    console.log(options);

    axios
      .request(options)
      .then(function (response) {
        console.log("res.data", response.data);
        const token = response.data.token;
        checkStatus(token);
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        setProcessing(false);
        console.log(error);
      });
  };

  // --------------------------------------------------------------


  //  SPEECH RECOGNITION CALL BACK ------------------------------
  
  // Function to handle changes (e.g., updating transcript or code)
  const handleChange = (action, value) => {
    if (action === "transcript") {
      setTranscript(value); // Assuming you have a `setTranscript` state updater
    } else if (action === "code") {
      setCode(value);
    }
    // Add more conditions as needed
  };

  // Inside Landing component
  const handleSpeechToCodeResponse = (response) => {
    console.log("Received from SpeechRecognitionComponent:", response);
    // Now you can do something with the response, e.g., update state
    setCode(response); // Example of setting code state with received data
  };


  // --------------------------------------------------

  // 
  const checkStatus = async (token) => {
    // We will come to the implementation later in the code
    const options = {
      method: "GET",
      url: "https://judge0-ce.p.rapidapi.com/submissions" + "/" + token,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        'X-RapidAPI-Key': '1c7fa412b9mshc09cfdc0adff1f5p11c09ejsn7c9c8243205f',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
    };

    console.log(options.url);

    try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;

      // Processed - we have a result
      if (statusId === 1 || statusId === 2) {
        // still processing
        setTimeout(() => {
          checkStatus(token)
        }, 2000)
        return
      } else {
        setProcessing(false)
        setOutputDetails(response.data)
        showSuccessToast(`Compiled Successfully!`)
        console.log('response.data', response.data)
        return
      }
    } catch (err) {
      console.log("err", err);
      setProcessing(false);
      showErrorToast();
    }
  };

  function handleThemeChange(th) {
    // We will come to the implementation later in the code
  }
  
  
  useEffect(() => {
    defineTheme("oceanic-next").then((_) =>
      setTheme({ value: "oceanic-next", label: "Oceanic Next" })
    );
  }, []);

  const showSuccessToast = (msg) => {
    toast.success(msg || `Compiled Successfully!`, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  const showErrorToast = (msg) => {
    toast.error(msg || `Something went wrong! Please try again.`, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="h-4 w-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"></div>
      <div className="px-4 py-2 flex flex-row justify-between">
        <LanguagesDropdown onSelectChange={onSelectChange} />
        <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
        
      </div>
      <div className="flex flex-row space-x-4 px-4 py-4">
        {/* Left Column for OutputWindow, CustomInput, and Compile Button */}
        <div className="left-container flex flex-col space-y-4 w-[50%]">
          <OutputWindow outputDetails={outputDetails} />
          <CustomInput customInput={customInput} setCustomInput={setCustomInput} />
          <button
            onClick={handleCompile}
            disabled={!code}
            className={classnames(
              "border-2 border-black rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white",
              !code ? "opacity-50" : ""
            )}
          >
            {processing ? "Processing..." : "Compile and Execute"}
          </button>
          {outputDetails && <OutputDetails outputDetails={outputDetails} />}
          <SpeechRecognitionComponent onChange={handleChange} onCodeGenerated={handleSpeechToCodeResponse} />
        </div>
        
        {/* Right Column for CodeEditorWindow */}
        <div className="right-container flex flex-grow w-[50%]">
          <CodeEditorWindow
            code={code}
            onChange={onChange}
            language={language?.value}
            theme={theme.value}
          />
        </div>
      </div>
    </>
  );
  
};
export default Landing;