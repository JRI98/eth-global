import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    useSystemColorMode: false,
    initialColorMode: "light",
  },

  styles: {
    global: {
      "html, body, root": {
        bgGradient: "linear(#C6FAD2 0%, #F6FFEE  60%)",
        h: "100%",
        w: "100%",
        color: "black",
        overflow: "auto",
      },
    },
  },
});

export default theme;
