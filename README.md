## AutoComPaste HTML

This repository consists of a basic experiment interface for conducting a copying and pasting experiment comparing two techniques: 1) AutoComPaste and 2) Traditional Copying and Pasting using keyboard shortcuts (Ctrl-C, Ctrl-V). You are to modify the code to suit your experimental design.


### Installation

You can either download as a zip file or clone this repository to get it running on your computer.

1. **Download Zip:**


  Click on the **"Download Zip"** button on the right to download the repository as a zip file.

2. **Clone the Repository:**

  We recommend forking this repository to your own Github account and cloning your forked version so that you have write access. You will need a Github account before you can fork it. Refer to this link on how to fork a repository to your own account: [https://help.github.com/articles/fork-a-repo/](https://help.github.com/articles/fork-a-repo/).

  Clone the forked repository using the following command:

  ```
  $ git clone git@github.com:<your username>/autocompaste-html.git
  ```

You will need your own local web server to run experiment. [XAMPP](https://www.apachefriends.org/index.html) or [MAMP](https://www.mamp.info/en/) are good choices for quick and easy setting up of local web servers. If you have Python installed, a simpler way exists. Running the following command in the root of the repository directory will start a local web server at port 8000:

```
$ python -m SimpleHTTPServer    // Python 2
$ python -m http.server         // Python 3
```

Visit [http://localhost:8000/](http://localhost:8000/) in your web browser (Chrome preferred) to see the welcome screen for the experiment. Github not only hosts code, it can also serve static content from repositories via [Github Pages](https://pages.github.com/). Pushing to the `gh-pages` branch of your repository will update the publicly accessible website for your project. You can try out this repository at [http://yangshun.github.io/autocompaste-html](http://yangshun.github.io/autocompaste-html). For your own forked repository, visit `http://<your username>.github.io/autocompaste-html`. Hosting the experiment on the WWW is a good way to let your friends participate in the experiment remotely. However, be sure to make your forked repository private to avoid being plagiarised.

### Interface Walkthrough

There are a total of 5 screens for experiment, each corresponding to a step of the experiment. The breakdown of the screens:

1. Welcome Screen
2. Pre-experiment Questionnaire
3. Instructions
4. Experiment
5. Post-experiment Questionnaire

##### Welcome Screen

Path: `index.html`.

The welcome interface of the experiment where basic instructions are provided to your participants. Collect input from the participant/experimenter the participant ID so that you can generate the correct experiment trials and data log for a particular experiment session.

The participant ID entered here will be saved into HTML5 `localStorage` and the value is refereenced in other screens too. If other pages are visited and the participant ID has not been set, the user will be prompted to enter a value to be used as the participant ID.


##### Pre-Experiment Questionnaire Screen

Path: `questionnaire-pre.html`.

This part of the interface collects whatever pre-experiment information. Please come up with a basic questionnaire to help you to gather participant information. The purpose of this questionnaire is to report the participant data and convince readers that you have picked an appropriate target user group and the result has certain generalizability.

You are given a template consisting of 5 basic kinds of form fields used in surveys. Modify the HTML in `questionnaire-pre.html` to add in your own questions and options. Upon clicking the **Submit** button, form responses on the page is serialized and CSV file containing the responses will be generated and available for downloading into the user's computer. The CSV file will be named `acp-<pid>-pre.csv`.

You are free to add in even more types of form fields and/or change the layout to suit your needs. However, it is up to you to ensure that your new form fields will be serialized properly when the **Submit** button is pressed.

No validation has been added for the form fields. You have to ensure your participant fills in the required fields properly. Alternatively, you can add your own validation code.

##### Instructions Screen

Path: `instructions.html`.

This page will contain information regarding instructions on the experiment that you want your participant to read before they start on the experiment. Modify this page's HTML to add your own instructions. Diagrams and screenshots demonstrating how to go about doing the experiment will be very helpful!

##### Instructions Screen

Path: `experiment.html`.

The experiment page is the most complicated of all. The screen is split into two sections, the left section contains the conditions of the experiment while the right section contains the text editor window and the windows containing text.

**Left Section**

The Technique, Granularity and Trial number will be displayed. In addition, you have to decide on the third independent variable that you want to test and modify/customize the code to suit your experiment design. Remember to update the UI to show the current value of the third independent variable for the current trial too!

The words in the red box are called the stimuli. This is the target text that the participants has to enter into the Text Editor window using one of the two techniques. Please ensure that the participants do not manually type the text in!

**Right Section**

There are two kinds of windows in the right section: 1) Text Editor window and 2) Articles window. The Text Editor window is meant for participants to enter their response to the stimuli using either one of the proposed copy-pasting techniques. The Articles windows contain text in various forms (point-form / essay). The text corresponding to the stimuli will be highlighted in yellow for easy identification in the cases of the TRADITIONAL copy-pasting technique.

When the AUTOCOMPASTE technique is active, typing three characters or more in the Text Editor will show a dropdown list of possible sentences that contain the characters/sentence that you have just entered, which are extracted from the contents of the open windows. Pressing the <kbd>↑</kbd>/<kbd>↓</kbd> buttons on the keyboard will scroll through the list of suggestions. Press <kbd>enter</kbd> to select a suggestion and the text editor will display the full selected sentence.

After selecting a sentence, pressing <kbd>←</kbd>/<kbd>→</kbd> button right after pressing enter, you can delete/append the next few sentences of the article to the Text Editor. Pressing <kbd>enter</kbd> or <kbd>space</kbd> would mean pasting the final text to the system.

After the participant is satisfied with the text entered in the text editor, pressing the **Next Task** button will load the next trial with its respective conditions.

Please remember to give the user a few non-timed trial sessions to familiarize themselves with the interface. Also, there should be a short minute break in the middle of the experiment.

After completing the experiment, the data containing the conditions and results of the trials will be generated in the form of a CSV file, `acp-<pid>-trials.csv`.


##### Post-Experiment Questionnaire Screen

Path: `questionnaire-post.html`.

Similar to the Pre-Experiment Questionnaire, in this screen, you will collect participants responses. However, unlike the Pre-Experiment Questionnaire, over here, you want to collect more qualitative and quantitative feedback about the tested techniques. Some of the typical questions include, personal preferences, any difficulties participants experienced in the experiment, and areas of improvement.

Please design a basic post-experimental questionnaire to help you to provide more in-depth information about the trade-offs between the tested techniques.

Upon clicking the Submit button, form responses on the page is serialized and CSV file containing the responses will be generated and available for downloading into the user's computer. The CSV file will be named `acp-<pid>-post.csv`.


### Documentation

All interface files are saved as `.html` files in the root directory of the repository. The names of the files correspond to the respective screens.

##### Page-specific Matters

At the bottom of the page there is JavaScript coded written, to handle the user interactions and fetching of participant IDs. Most of the code is pretty trivial, except the script at the bottom of `experiment.html`. You will need to modify the code at the bottom of `experiment.html` to add in non-timed trial runs and a short break in the middle of the experiment.

**DO NOT** modify the names of the files as the file names are hardcoded in each page for navigation purposes.

##### ACPToolKit.js

Every page includes the library `ACPToolKit.js`, which provides some common utility functions that you will need for the experiment. `ACPToolKit.js` exposes the global variable `ACPToolKit` and has the following public functions:

- `setCurrentParticipantId ( <String> id)`

	**Description:**
	Changes the current participant ID value, that is referenced across every screen.

- `getCurrentParticipantId ()`

	**Returns:** 
	- `participant_id`: The current participant ID value.
	
	**Description:**

	 If the participant ID has not been set, the user will be prompted to enter a string value.
	
- `clearParticipantId ()`
	
	Clears the `localStorage` of the `pid` value.

- `downloadFormData (formResponses, type)`

	**Parameters:**	

	- `formResponses`: An array of objects `{ name: <label>, value: <value>}`.
	- `type`: A string that will be appended to the file name of the generated CSV.
	
	**Description:**
	
	This function generate a CSV file consisting of a row of headers and a row of values
	from the array of objects passed in. The `name` keys of the objects will form the row 	of	headers and the `value` keys will form the row of values. This method is being used 	by the Pre-Experiment Questionnaire and Post-Experiment Questionnaire pages. A CSV file 	is generated that will be downloaded by the user's browser.
	

- `downloadTrialResults (data)`

	**Parameters:**	

	- `data`: A two-dimensional array where each element in the array should be a number or a string.
	
	**Description:**
	
	This function takes in a two-dimensional array that represents the trial results and 	generates a CSV file out of it. The header row has to be the first array in the two-dimensional array.

- `presentTrial (options)`

	**Parameters:**	

	- `options`: An object that recognizes the following keys:
		- `technique`: The technique for the current trial, either **"AUTOCOMPASTE"** or **"TRADITIONAL"**. The interface will enable/disable the AutoComPaste functionality.
		- `granularity`: Level of granularity of the stimuli of the current trial. one of the three values **"sentence"**, **"phrase"**, or **"paragraph"**. Note that this value is only used to update the 			interface for displaying of the conditions.
		- `data_file`: The path to a JSON file consisting of a data object. The format of the data object will be explained in detail later.
		- `stimuli`: The stimuli for a trial. There is no checking done by `ACPToolkit.js` to ensure that the stimuli here is consistent with the `granularity` given above.
	
	**Description:**
	
	Upon invoking of this function, the experiment interface will be cleared and the Text Editor and Article windows will be showed. The number of windows being showed depends on the number of objects in the JSON file referenced by `data_file`. **Note:** This method is only available on the `experiment.html` page.
	

- `getCurrentTrialState ()`

	**Returns:**	

	- `options`: An object containing the following keys:
		- `technique`: The `technique` value for the current trial.
		- `granularity`: The `granularity` value for the current trial.
		- `data_file`: The `data_file` value for the current trial.
		- `technique`: The `technique` value for the current trial.
		- `start_time`: The starting time of the current trial, given in milliseconds since midnight 01 January, 1970 UTC.
		- `end_time`: The ending time of the current trial, given in milliseconds since midnight 01 January, 1970 UTC.
		- `duration`: The duration of the current trial, given in milliseconds.
		- `user_response`: The text entered in the Text Editor window.
	
	**Description:**
	
	Returns the state of the current trial. This method has to called to retrieve the current trial's state before the next `presentTrial()` is called or else the data will be overwritten. **Note:** This method is only available on the `experiment.html` page.

	
##### Data Object File


Paths to data object files are being passed into the `ACPToolKit.presentTrial()` method as one of the values. Each data object file has to have the following format, an array of objects with the keys `title` and `url`.

```
[
    {
        "title": "Title of Article 1",
        "url": "path/to/article/1"
    },
    {
        "title": "Title of Article 2",
        "url": "path/to/article/2"
    },
    ...
]
```
    
Each object in the array will be transformed into a window and displayed in the interface, with `title` corresponding to the window title and text content loaded from the file located at `url`. Refer to `data/texts.json` for an example of the data object file. Each article should be in the `.txt` format.


### Credits

- Tay Yang Shun (Interface and ACPToolKit)
- Wong Yong Jie (AutoComPaste Engine)
