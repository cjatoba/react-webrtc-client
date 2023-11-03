import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export const Toast = ({ type = "success", message }) => {
  const [showToast, setShowToast] = useState(true);

  const successIcon = (
    <FontAwesomeIcon
      className="text-green-500"
      icon={["fas", "check-circle"]}
    />
  );
  const errorIcon = (
    <FontAwesomeIcon
      className="text-red-500"
      icon={["fas", "exclamation-triangle"]}
    />
  );
  const infoIcon = (
    <FontAwesomeIcon className="text-blue-500" icon={["fas", "info-circle"]} />
  );
  const warningIcon = (
    <FontAwesomeIcon
      className="text-yellow-500"
      icon={["fas", "exclamation-circle"]}
    />
  );

  const icon = {
    success: successIcon,
    error: errorIcon,
    info: infoIcon,
    warning: warningIcon,
  };

  const toastIcon = icon[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  });

  if (!showToast) {
    return null;
  }

  return (
    <div
      id="toast"
      class="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800"
      role="alert"
    >
      <section>
        {toastIcon}
        <span class="sr-only">{`${type} icon`}</span>
      </section>
      <div class="ml-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
        data-dismiss-target="#toast"
        aria-label="Close"
      >
        <span class="sr-only">Close</span>
        <svg
          class="w-3 h-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>
      </button>
    </div>
  );
};
