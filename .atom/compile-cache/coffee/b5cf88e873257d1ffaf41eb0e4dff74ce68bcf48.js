(function() {
  module.exports = {
    name: "GLSL",
    namespace: "glsl",

    /*
    Supported Grammars
     */
    grammars: ["C", "opencl", "GLSL"],

    /*
    Supported extensions
     */
    extensions: ["vert", "frag"],
    options: {
      configPath: {
        type: 'string',
        "default": "",
        description: "Path to clang-format config file. i.e. clang-format.cfg"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvbGFuZ3VhZ2VzL2dsc2wuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQUEsSUFFZixJQUFBLEVBQU0sTUFGUztBQUFBLElBR2YsU0FBQSxFQUFXLE1BSEk7QUFLZjtBQUFBOztPQUxlO0FBQUEsSUFRZixRQUFBLEVBQVUsQ0FDUixHQURRLEVBRVIsUUFGUSxFQUdSLE1BSFEsQ0FSSztBQWNmO0FBQUE7O09BZGU7QUFBQSxJQWlCZixVQUFBLEVBQVksQ0FDVixNQURVLEVBRVYsTUFGVSxDQWpCRztBQUFBLElBc0JmLE9BQUEsRUFDRTtBQUFBLE1BQUEsVUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEVBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSx5REFGYjtPQURGO0tBdkJhO0dBQWpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tane/.atom/packages/atom-beautify/src/languages/glsl.coffee
