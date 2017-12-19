(function() {
  var path;

  path = require('path');

  module.exports = {
    toggles: {
      type: 'object',
      order: 1,
      properties: {
        autoClose: {
          title: 'Close Terminal on Exit',
          description: 'Should the terminal close if the shell exits?',
          type: 'boolean',
          "default": false
        },
        cursorBlink: {
          title: 'Cursor Blink',
          description: 'Should the cursor blink when the terminal is active?',
          type: 'boolean',
          "default": true
        },
        runInsertedText: {
          title: 'Run Inserted Text',
          description: 'Run text inserted via `terminal-plus:insert-text` as a command? **This will append an end-of-line character to input.**',
          type: 'boolean',
          "default": true
        }
      }
    },
    core: {
      type: 'object',
      order: 2,
      properties: {
        autoRunCommand: {
          title: 'Auto Run Command',
          description: 'Command to run on terminal initialization.',
          type: 'string',
          "default": ''
        },
        defaultView: {
          title: 'Default View Type',
          description: 'Set the default view to open when creating a new terminal.',
          type: 'string',
          "default": 'Match Active Terminal',
          "enum": ['Panel', 'Tab', 'Match Active Terminal']
        },
        mapTerminalsTo: {
          title: 'Map Terminals To',
          description: 'Map terminals to each file or folder. Default is no action or mapping at all. **Restart required.**',
          type: 'string',
          "default": 'None',
          "enum": ['None', 'File', 'Folder']
        },
        mapTerminalsToAutoOpen: {
          title: 'Auto Open a New Terminal (For Terminal Mapping)',
          description: 'Should a new terminal be opened for new items? **Note:** This works in conjunction with `Map Terminals To` above.',
          type: 'boolean',
          "default": false
        },
        scrollback: {
          title: 'Scroll Back',
          description: 'How many lines of history should be kept?',
          type: 'integer',
          "default": 1000
        },
        shell: {
          title: 'Shell Override',
          description: 'Override the default shell instance to launch.',
          type: 'string',
          "default": (function() {
            if (process.platform === 'win32') {
              return path.resolve(process.env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
            } else {
              return process.env.SHELL;
            }
          })()
        },
        shellArguments: {
          title: 'Shell Arguments',
          description: 'Specify some arguments to use when launching the shell.',
          type: 'string',
          "default": ''
        },
        statusBar: {
          title: 'Status Bar',
          description: 'Choose how you want the status bar displayed.',
          type: 'string',
          "default": 'Full',
          "enum": ['Full', 'Collapsed', 'None']
        },
        workingDirectory: {
          title: 'Working Directory',
          description: 'Which directory should be the present working directory when a new terminal is made?',
          type: 'string',
          "default": 'Project',
          "enum": ['Home', 'Project', 'Active File']
        }
      }
    },
    style: {
      type: 'object',
      order: 3,
      properties: {
        animationSpeed: {
          title: 'Animation Speed',
          description: 'How fast should the window animate?',
          type: 'number',
          "default": '1',
          minimum: '0',
          maximum: '100'
        },
        fontAntialiasing: {
          title: 'Font Antialiasing',
          description: 'Set the type of font antialiasing for the terminal.',
          type: 'string',
          "default": 'Antialiased',
          "enum": ['Antialiased', 'Default', 'None']
        },
        fontFamily: {
          title: 'Font Family',
          description: 'Override the terminal\'s default font family. **You must use a [monospaced font](https://en.wikipedia.org/wiki/List_of_typefaces#Monospace)!**',
          type: 'string',
          "default": ''
        },
        fontSize: {
          title: 'Font Size',
          description: 'Override the terminal\'s default font size.',
          type: 'string',
          "default": ''
        },
        defaultPanelHeight: {
          title: 'Default Panel Height',
          description: 'Default height of a terminal panel. **You may enter a value in px, em, or %.**',
          type: 'string',
          "default": '300px'
        },
        theme: {
          title: 'Theme',
          description: 'Select a theme for the terminal.',
          type: 'string',
          "default": 'standard'
        },
        "enum": ['standard', 'inverse', 'grass', 'homebrew', 'man-page', 'novel', 'ocean', 'pro', 'red', 'red-sands', 'silver-aerogel', 'solid-colors', 'dracula']
      }
    },
    ansiColors: {
      type: 'object',
      order: 4,
      properties: {
        normal: {
          type: 'object',
          order: 1,
          properties: {
            black: {
              title: 'Black',
              description: 'Black color used for terminal ANSI color set.',
              type: 'color',
              "default": '#000000'
            },
            red: {
              title: 'Red',
              description: 'Red color used for terminal ANSI color set.',
              type: 'color',
              "default": '#CD0000'
            },
            green: {
              title: 'Green',
              description: 'Green color used for terminal ANSI color set.',
              type: 'color',
              "default": '#00CD00'
            },
            yellow: {
              title: 'Yellow',
              description: 'Yellow color used for terminal ANSI color set.',
              type: 'color',
              "default": '#CDCD00'
            },
            blue: {
              title: 'Blue',
              description: 'Blue color used for terminal ANSI color set.',
              type: 'color',
              "default": '#0000CD'
            },
            magenta: {
              title: 'Magenta',
              description: 'Magenta color used for terminal ANSI color set.',
              type: 'color',
              "default": '#CD00CD'
            },
            cyan: {
              title: 'Cyan',
              description: 'Cyan color used for terminal ANSI color set.',
              type: 'color',
              "default": '#00CDCD'
            },
            white: {
              title: 'White',
              description: 'White color used for terminal ANSI color set.',
              type: 'color',
              "default": '#E5E5E5'
            }
          }
        },
        zBright: {
          type: 'object',
          order: 2,
          properties: {
            brightBlack: {
              title: 'Bright Black',
              description: 'Bright black color used for terminal ANSI color set.',
              type: 'color',
              "default": '#7F7F7F'
            },
            brightRed: {
              title: 'Bright Red',
              description: 'Bright red color used for terminal ANSI color set.',
              type: 'color',
              "default": '#FF0000'
            },
            brightGreen: {
              title: 'Bright Green',
              description: 'Bright green color used for terminal ANSI color set.',
              type: 'color',
              "default": '#00FF00'
            },
            brightYellow: {
              title: 'Bright Yellow',
              description: 'Bright yellow color used for terminal ANSI color set.',
              type: 'color',
              "default": '#FFFF00'
            },
            brightBlue: {
              title: 'Bright Blue',
              description: 'Bright blue color used for terminal ANSI color set.',
              type: 'color',
              "default": '#0000FF'
            },
            brightMagenta: {
              title: 'Bright Magenta',
              description: 'Bright magenta color used for terminal ANSI color set.',
              type: 'color',
              "default": '#FF00FF'
            },
            brightCyan: {
              title: 'Bright Cyan',
              description: 'Bright cyan color used for terminal ANSI color set.',
              type: 'color',
              "default": '#00FFFF'
            },
            brightWhite: {
              title: 'Bright White',
              description: 'Bright white color used for terminal ANSI color set.',
              type: 'color',
              "default": '#FFFFFF'
            }
          }
        }
      }
    },
    iconColors: {
      type: 'object',
      order: 5,
      properties: {
        red: {
          title: 'Status Icon Red',
          description: 'Red color used for status icon.',
          type: 'color',
          "default": 'red'
        },
        orange: {
          title: 'Status Icon Orange',
          description: 'Orange color used for status icon.',
          type: 'color',
          "default": 'orange'
        },
        yellow: {
          title: 'Status Icon Yellow',
          description: 'Yellow color used for status icon.',
          type: 'color',
          "default": 'yellow'
        },
        green: {
          title: 'Status Icon Green',
          description: 'Green color used for status icon.',
          type: 'color',
          "default": 'green'
        },
        blue: {
          title: 'Status Icon Blue',
          description: 'Blue color used for status icon.',
          type: 'color',
          "default": 'blue'
        },
        purple: {
          title: 'Status Icon Purple',
          description: 'Purple color used for status icon.',
          type: 'color',
          "default": 'purple'
        },
        pink: {
          title: 'Status Icon Pink',
          description: 'Pink color used for status icon.',
          type: 'color',
          "default": 'hotpink'
        },
        cyan: {
          title: 'Status Icon Cyan',
          description: 'Cyan color used for status icon.',
          type: 'color',
          "default": 'cyan'
        },
        magenta: {
          title: 'Status Icon Magenta',
          description: 'Magenta color used for status icon.',
          type: 'color',
          "default": 'magenta'
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvdGVybWluYWwtcGx1cy9saWIvY29uZmlnLXNjaGVtYS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsT0FBQSxFQUNFO01BQUEsSUFBQSxFQUFNLFFBQU47TUFDQSxLQUFBLEVBQU8sQ0FEUDtNQUVBLFVBQUEsRUFDRTtRQUFBLFNBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyx3QkFBUDtVQUNBLFdBQUEsRUFBYSwrQ0FEYjtVQUVBLElBQUEsRUFBTSxTQUZOO1VBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO1NBREY7UUFLQSxXQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sY0FBUDtVQUNBLFdBQUEsRUFBYSxzREFEYjtVQUVBLElBQUEsRUFBTSxTQUZOO1VBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUhUO1NBTkY7UUFVQSxlQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sbUJBQVA7VUFDQSxXQUFBLEVBQWEseUhBRGI7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFIVDtTQVhGO09BSEY7S0FERjtJQW1CQSxJQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sUUFBTjtNQUNBLEtBQUEsRUFBTyxDQURQO01BRUEsVUFBQSxFQUNFO1FBQUEsY0FBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLGtCQUFQO1VBQ0EsV0FBQSxFQUFhLDRDQURiO1VBRUEsSUFBQSxFQUFNLFFBRk47VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBSFQ7U0FERjtRQUtBLFdBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxtQkFBUDtVQUNBLFdBQUEsRUFBYSw0REFEYjtVQUVBLElBQUEsRUFBTSxRQUZOO1VBR0EsQ0FBQSxP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SUFBQSxFQUFNLE9BRk47VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBSFQ7U0F6Q0Y7T0FIRjtLQWpPRjs7QUFIRiIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIHRvZ2dsZXM6XG4gICAgdHlwZTogJ29iamVjdCdcbiAgICBvcmRlcjogMVxuICAgIHByb3BlcnRpZXM6XG4gICAgICBhdXRvQ2xvc2U6XG4gICAgICAgIHRpdGxlOiAnQ2xvc2UgVGVybWluYWwgb24gRXhpdCdcbiAgICAgICAgZGVzY3JpcHRpb246ICdTaG91bGQgdGhlIHRlcm1pbmFsIGNsb3NlIGlmIHRoZSBzaGVsbCBleGl0cz8nXG4gICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgY3Vyc29yQmxpbms6XG4gICAgICAgIHRpdGxlOiAnQ3Vyc29yIEJsaW5rJ1xuICAgICAgICBkZXNjcmlwdGlvbjogJ1Nob3VsZCB0aGUgY3Vyc29yIGJsaW5rIHdoZW4gdGhlIHRlcm1pbmFsIGlzIGFjdGl2ZT8nXG4gICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBydW5JbnNlcnRlZFRleHQ6XG4gICAgICAgIHRpdGxlOiAnUnVuIEluc2VydGVkIFRleHQnXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUnVuIHRleHQgaW5zZXJ0ZWQgdmlhIGB0ZXJtaW5hbC1wbHVzOmluc2VydC10ZXh0YCBhcyBhIGNvbW1hbmQ/ICoqVGhpcyB3aWxsIGFwcGVuZCBhbiBlbmQtb2YtbGluZSBjaGFyYWN0ZXIgdG8gaW5wdXQuKionXG4gICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICBkZWZhdWx0OiB0cnVlXG4gIGNvcmU6XG4gICAgdHlwZTogJ29iamVjdCdcbiAgICBvcmRlcjogMlxuICAgIHByb3BlcnRpZXM6XG4gICAgICBhdXRvUnVuQ29tbWFuZDpcbiAgICAgICAgdGl0bGU6ICdBdXRvIFJ1biBDb21tYW5kJ1xuICAgICAgICBkZXNjcmlwdGlvbjogJ0NvbW1hbmQgdG8gcnVuIG9uIHRlcm1pbmFsIGluaXRpYWxpemF0aW9uLidcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgZGVmYXVsdDogJydcbiAgICAgIGRlZmF1bHRWaWV3OlxuICAgICAgICB0aXRsZTogJ0RlZmF1bHQgVmlldyBUeXBlJ1xuICAgICAgICBkZXNjcmlwdGlvbjogJ1NldCB0aGUgZGVmYXVsdCB2aWV3IHRvIG9wZW4gd2hlbiBjcmVhdGluZyBhIG5ldyB0ZXJtaW5hbC4nXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgIGRlZmF1bHQ6ICdNYXRjaCBBY3RpdmUgVGVybWluYWwnXG4gICAgICAgIGVudW06IFtcbiAgICAgICAgICAnUGFuZWwnLFxuICAgICAgICAgICdUYWInLFxuICAgICAgICAgICdNYXRjaCBBY3RpdmUgVGVybWluYWwnXG4gICAgICAgIF1cbiAgICAgIG1hcFRlcm1pbmFsc1RvOlxuICAgICAgICB0aXRsZTogJ01hcCBUZXJtaW5hbHMgVG8nXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTWFwIHRlcm1pbmFscyB0byBlYWNoIGZpbGUgb3IgZm9sZGVyLiBEZWZhdWx0IGlzIG5vIGFjdGlvbiBvciBtYXBwaW5nIGF0IGFsbC4gKipSZXN0YXJ0IHJlcXVpcmVkLioqJ1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICBkZWZhdWx0OiAnTm9uZSdcbiAgICAgICAgZW51bTogWydOb25lJywgJ0ZpbGUnLCAnRm9sZGVyJ11cbiAgICAgIG1hcFRlcm1pbmFsc1RvQXV0b09wZW46XG4gICAgICAgIHRpdGxlOiAnQXV0byBPcGVuIGEgTmV3IFRlcm1pbmFsIChGb3IgVGVybWluYWwgTWFwcGluZyknXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnU2hvdWxkIGEgbmV3IHRlcm1pbmFsIGJlIG9wZW5lZCBmb3IgbmV3IGl0ZW1zPyAqKk5vdGU6KiogVGhpcyB3b3JrcyBpbiBjb25qdW5jdGlvbiB3aXRoIGBNYXAgVGVybWluYWxzIFRvYCBhYm92ZS4nXG4gICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgc2Nyb2xsYmFjazpcbiAgICAgICAgdGl0bGU6ICdTY3JvbGwgQmFjaydcbiAgICAgICAgZGVzY3JpcHRpb246ICdIb3cgbWFueSBsaW5lcyBvZiBoaXN0b3J5IHNob3VsZCBiZSBrZXB0PydcbiAgICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICAgIGRlZmF1bHQ6IDEwMDBcbiAgICAgIHNoZWxsOlxuICAgICAgICB0aXRsZTogJ1NoZWxsIE92ZXJyaWRlJ1xuICAgICAgICBkZXNjcmlwdGlvbjogJ092ZXJyaWRlIHRoZSBkZWZhdWx0IHNoZWxsIGluc3RhbmNlIHRvIGxhdW5jaC4nXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgIGRlZmF1bHQ6IGRvIC0+XG4gICAgICAgICAgaWYgcHJvY2Vzcy5wbGF0Zm9ybSBpcyAnd2luMzInXG4gICAgICAgICAgICBwYXRoLnJlc29sdmUocHJvY2Vzcy5lbnYuU3lzdGVtUm9vdCwgJ1N5c3RlbTMyJywgJ1dpbmRvd3NQb3dlclNoZWxsJywgJ3YxLjAnLCAncG93ZXJzaGVsbC5leGUnKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHByb2Nlc3MuZW52LlNIRUxMXG4gICAgICBzaGVsbEFyZ3VtZW50czpcbiAgICAgICAgdGl0bGU6ICdTaGVsbCBBcmd1bWVudHMnXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnU3BlY2lmeSBzb21lIGFyZ3VtZW50cyB0byB1c2Ugd2hlbiBsYXVuY2hpbmcgdGhlIHNoZWxsLidcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgZGVmYXVsdDogJydcbiAgICAgIHN0YXR1c0JhcjpcbiAgICAgICAgdGl0bGU6ICdTdGF0dXMgQmFyJ1xuICAgICAgICBkZXNjcmlwdGlvbjogJ0Nob29zZSBob3cgeW91IHdhbnQgdGhlIHN0YXR1cyBiYXIgZGlzcGxheWVkLidcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgZGVmYXVsdDogJ0Z1bGwnXG4gICAgICAgIGVudW06IFsnRnVsbCcsICdDb2xsYXBzZWQnLCAnTm9uZSddXG4gICAgICB3b3JraW5nRGlyZWN0b3J5OlxuICAgICAgICB0aXRsZTogJ1dvcmtpbmcgRGlyZWN0b3J5J1xuICAgICAgICBkZXNjcmlwdGlvbjogJ1doaWNoIGRpcmVjdG9yeSBzaG91bGQgYmUgdGhlIHByZXNlbnQgd29ya2luZyBkaXJlY3Rvcnkgd2hlbiBhIG5ldyB0ZXJtaW5hbCBpcyBtYWRlPydcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgZGVmYXVsdDogJ1Byb2plY3QnXG4gICAgICAgIGVudW06IFsnSG9tZScsICdQcm9qZWN0JywgJ0FjdGl2ZSBGaWxlJ11cbiAgc3R5bGU6XG4gICAgdHlwZTogJ29iamVjdCdcbiAgICBvcmRlcjogM1xuICAgIHByb3BlcnRpZXM6XG4gICAgICBhbmltYXRpb25TcGVlZDpcbiAgICAgICAgdGl0bGU6ICdBbmltYXRpb24gU3BlZWQnXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnSG93IGZhc3Qgc2hvdWxkIHRoZSB3aW5kb3cgYW5pbWF0ZT8nXG4gICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICAgIGRlZmF1bHQ6ICcxJ1xuICAgICAgICBtaW5pbXVtOiAnMCdcbiAgICAgICAgbWF4aW11bTogJzEwMCdcbiAgICAgIGZvbnRBbnRpYWxpYXNpbmc6XG4gICAgICAgIHRpdGxlOiAnRm9udCBBbnRpYWxpYXNpbmcnXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnU2V0IHRoZSB0eXBlIG9mIGZvbnQgYW50aWFsaWFzaW5nIGZvciB0aGUgdGVybWluYWwuJ1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICBkZWZhdWx0OiAnQW50aWFsaWFzZWQnXG4gICAgICAgIGVudW06IFsnQW50aWFsaWFzZWQnLCAnRGVmYXVsdCcsICdOb25lJ11cbiAgICAgIGZvbnRGYW1pbHk6XG4gICAgICAgIHRpdGxlOiAnRm9udCBGYW1pbHknXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnT3ZlcnJpZGUgdGhlIHRlcm1pbmFsXFwncyBkZWZhdWx0IGZvbnQgZmFtaWx5LiAqKllvdSBtdXN0IHVzZSBhIFttb25vc3BhY2VkIGZvbnRdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xpc3Rfb2ZfdHlwZWZhY2VzI01vbm9zcGFjZSkhKionXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICBmb250U2l6ZTpcbiAgICAgICAgdGl0bGU6ICdGb250IFNpemUnXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnT3ZlcnJpZGUgdGhlIHRlcm1pbmFsXFwncyBkZWZhdWx0IGZvbnQgc2l6ZS4nXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICBkZWZhdWx0UGFuZWxIZWlnaHQ6XG4gICAgICAgIHRpdGxlOiAnRGVmYXVsdCBQYW5lbCBIZWlnaHQnXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRGVmYXVsdCBoZWlnaHQgb2YgYSB0ZXJtaW5hbCBwYW5lbC4gKipZb3UgbWF5IGVudGVyIGEgdmFsdWUgaW4gcHgsIGVtLCBvciAlLioqJ1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICBkZWZhdWx0OiAnMzAwcHgnXG4gICAgICB0aGVtZTpcbiAgICAgICAgdGl0bGU6ICdUaGVtZSdcbiAgICAgICAgZGVzY3JpcHRpb246ICdTZWxlY3QgYSB0aGVtZSBmb3IgdGhlIHRlcm1pbmFsLidcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgZGVmYXVsdDogJ3N0YW5kYXJkJ1xuICAgICAgZW51bTogW1xuICAgICAgICAnc3RhbmRhcmQnLFxuICAgICAgICAnaW52ZXJzZScsXG4gICAgICAgICdncmFzcycsXG4gICAgICAgICdob21lYnJldycsXG4gICAgICAgICdtYW4tcGFnZScsXG4gICAgICAgICdub3ZlbCcsXG4gICAgICAgICdvY2VhbicsXG4gICAgICAgICdwcm8nLFxuICAgICAgICAncmVkJyxcbiAgICAgICAgJ3JlZC1zYW5kcycsXG4gICAgICAgICdzaWx2ZXItYWVyb2dlbCcsXG4gICAgICAgICdzb2xpZC1jb2xvcnMnLFxuICAgICAgICAnZHJhY3VsYSdcbiAgICAgIF1cbiAgYW5zaUNvbG9yczpcbiAgICB0eXBlOiAnb2JqZWN0J1xuICAgIG9yZGVyOiA0XG4gICAgcHJvcGVydGllczpcbiAgICAgIG5vcm1hbDpcbiAgICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgICAgb3JkZXI6IDFcbiAgICAgICAgcHJvcGVydGllczpcbiAgICAgICAgICBibGFjazpcbiAgICAgICAgICAgIHRpdGxlOiAnQmxhY2snXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JsYWNrIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgIGRlZmF1bHQ6ICcjMDAwMDAwJ1xuICAgICAgICAgIHJlZDpcbiAgICAgICAgICAgIHRpdGxlOiAnUmVkJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdSZWQgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgZGVmYXVsdDogJyNDRDAwMDAnXG4gICAgICAgICAgZ3JlZW46XG4gICAgICAgICAgICB0aXRsZTogJ0dyZWVuJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdHcmVlbiBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICBkZWZhdWx0OiAnIzAwQ0QwMCdcbiAgICAgICAgICB5ZWxsb3c6XG4gICAgICAgICAgICB0aXRsZTogJ1llbGxvdydcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnWWVsbG93IGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgIGRlZmF1bHQ6ICcjQ0RDRDAwJ1xuICAgICAgICAgIGJsdWU6XG4gICAgICAgICAgICB0aXRsZTogJ0JsdWUnXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JsdWUgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgZGVmYXVsdDogJyMwMDAwQ0QnXG4gICAgICAgICAgbWFnZW50YTpcbiAgICAgICAgICAgIHRpdGxlOiAnTWFnZW50YSdcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTWFnZW50YSBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICBkZWZhdWx0OiAnI0NEMDBDRCdcbiAgICAgICAgICBjeWFuOlxuICAgICAgICAgICAgdGl0bGU6ICdDeWFuJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdDeWFuIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgIGRlZmF1bHQ6ICcjMDBDRENEJ1xuICAgICAgICAgIHdoaXRlOlxuICAgICAgICAgICAgdGl0bGU6ICdXaGl0ZSdcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnV2hpdGUgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgZGVmYXVsdDogJyNFNUU1RTUnXG4gICAgICB6QnJpZ2h0OlxuICAgICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgICBvcmRlcjogMlxuICAgICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICAgIGJyaWdodEJsYWNrOlxuICAgICAgICAgICAgdGl0bGU6ICdCcmlnaHQgQmxhY2snXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCBibGFjayBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICBkZWZhdWx0OiAnIzdGN0Y3RidcbiAgICAgICAgICBicmlnaHRSZWQ6XG4gICAgICAgICAgICB0aXRsZTogJ0JyaWdodCBSZWQnXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCByZWQgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgZGVmYXVsdDogJyNGRjAwMDAnXG4gICAgICAgICAgYnJpZ2h0R3JlZW46XG4gICAgICAgICAgICB0aXRsZTogJ0JyaWdodCBHcmVlbidcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJpZ2h0IGdyZWVuIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgIGRlZmF1bHQ6ICcjMDBGRjAwJ1xuICAgICAgICAgIGJyaWdodFllbGxvdzpcbiAgICAgICAgICAgIHRpdGxlOiAnQnJpZ2h0IFllbGxvdydcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJpZ2h0IHllbGxvdyBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICBkZWZhdWx0OiAnI0ZGRkYwMCdcbiAgICAgICAgICBicmlnaHRCbHVlOlxuICAgICAgICAgICAgdGl0bGU6ICdCcmlnaHQgQmx1ZSdcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJpZ2h0IGJsdWUgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgZGVmYXVsdDogJyMwMDAwRkYnXG4gICAgICAgICAgYnJpZ2h0TWFnZW50YTpcbiAgICAgICAgICAgIHRpdGxlOiAnQnJpZ2h0IE1hZ2VudGEnXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCBtYWdlbnRhIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgIGRlZmF1bHQ6ICcjRkYwMEZGJ1xuICAgICAgICAgIGJyaWdodEN5YW46XG4gICAgICAgICAgICB0aXRsZTogJ0JyaWdodCBDeWFuJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCcmlnaHQgY3lhbiBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICBkZWZhdWx0OiAnIzAwRkZGRidcbiAgICAgICAgICBicmlnaHRXaGl0ZTpcbiAgICAgICAgICAgIHRpdGxlOiAnQnJpZ2h0IFdoaXRlJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCcmlnaHQgd2hpdGUgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgZGVmYXVsdDogJyNGRkZGRkYnXG4gIGljb25Db2xvcnM6XG4gICAgdHlwZTogJ29iamVjdCdcbiAgICBvcmRlcjogNVxuICAgIHByb3BlcnRpZXM6XG4gICAgICByZWQ6XG4gICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gUmVkJ1xuICAgICAgICBkZXNjcmlwdGlvbjogJ1JlZCBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgZGVmYXVsdDogJ3JlZCdcbiAgICAgIG9yYW5nZTpcbiAgICAgICAgdGl0bGU6ICdTdGF0dXMgSWNvbiBPcmFuZ2UnXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnT3JhbmdlIGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICBkZWZhdWx0OiAnb3JhbmdlJ1xuICAgICAgeWVsbG93OlxuICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIFllbGxvdydcbiAgICAgICAgZGVzY3JpcHRpb246ICdZZWxsb3cgY29sb3IgdXNlZCBmb3Igc3RhdHVzIGljb24uJ1xuICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgIGRlZmF1bHQ6ICd5ZWxsb3cnXG4gICAgICBncmVlbjpcbiAgICAgICAgdGl0bGU6ICdTdGF0dXMgSWNvbiBHcmVlbidcbiAgICAgICAgZGVzY3JpcHRpb246ICdHcmVlbiBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgZGVmYXVsdDogJ2dyZWVuJ1xuICAgICAgYmx1ZTpcbiAgICAgICAgdGl0bGU6ICdTdGF0dXMgSWNvbiBCbHVlJ1xuICAgICAgICBkZXNjcmlwdGlvbjogJ0JsdWUgY29sb3IgdXNlZCBmb3Igc3RhdHVzIGljb24uJ1xuICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgIGRlZmF1bHQ6ICdibHVlJ1xuICAgICAgcHVycGxlOlxuICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIFB1cnBsZSdcbiAgICAgICAgZGVzY3JpcHRpb246ICdQdXJwbGUgY29sb3IgdXNlZCBmb3Igc3RhdHVzIGljb24uJ1xuICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgIGRlZmF1bHQ6ICdwdXJwbGUnXG4gICAgICBwaW5rOlxuICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIFBpbmsnXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUGluayBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgZGVmYXVsdDogJ2hvdHBpbmsnXG4gICAgICBjeWFuOlxuICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIEN5YW4nXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQ3lhbiBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgZGVmYXVsdDogJ2N5YW4nXG4gICAgICBtYWdlbnRhOlxuICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIE1hZ2VudGEnXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTWFnZW50YSBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgZGVmYXVsdDogJ21hZ2VudGEnXG4iXX0=
