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

You will need your own local web server to run experiment. [XAMPP](git@github.com:yangshun/autocompaste-html.git) or [MAMP](https://www.mamp.info/en/) are good choices for quick and easy setting up of local web servers. If you have Python installed, a simpler way exists. Running the following command in the root of the repository directory will start a local web server at port 8000:

```
$ python -m SimpleHTTPServer  // Python 2
$ python -m http.server     // Python 3
```

Visit [http://localhost:8000/](http://localhost:8000/) in your web browser (Chrome preferred) to see the welcome screen for the experiment.

### Interface

There are a total of 5 screens for experiment, each corresponding to a step of the experiment. The breakdown of the screens:

1. Welcome Screen
2. Pre-experiment Questionnaire
3. Instructions
4. Experiment
5. Post-experiment Questionnaire

##### Welcome Screen

Path: `index.html`.

The welcome interface of the experiment where basic instructions are provided to your participants. Collect input from the participant/experimenter the participant ID so that you can generate the correct experiment trials and data log for a particular experiment session.

The participant ID entered here will be saved into HTML5 `localStorage` and can be obtained from other screens too.

##### Pre-Experiment Questionnaire Screen

Path: `questionnaire-pre.html`.

This part of the interface collects whatever pre-experiment information. Please come up with a basic questionnaire to help you to gather participant information. The purpose of this questionnaire is to report the participant data and convince readers that you have picked an appropriate target user group and the result has certain generalizability.

You are given a template consisting of 5 basic kinds of form fields used in surveys. Modify the HTML in `questionnaire-pre.html` to add in your own questions and options. Upon clicking the **Submit** button, form responses on the page is serialized and CSV file containing the responses will be generated and available for downloading into the user's computer. The CSV file will be named `acp-<pid>-pre.csv`.

You are free to add in even more types of form fields and/or change the layout to suit your needs. However, it is up to you to ensure that your new form fields will be serialized properly when the **Submit** button is pressed.

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

When the AUTOCOMPASTE technique is active, typing three characters or more in the Text Editor will show a dropdown list of possible sentences that contain the characters/sentence that you have just entered, which are extracted from the contents of the open windows. Pressing the <kbd>↑</kbd>/<kbd>↓</kbd> buttons on the keyboard will scroll through the list of suggestions. Press <kbd>Enter</kbd> to select a suggestion and the text editor will display the full selected sentence.

After selecting a sentence, pressing <kbd>←</kbd>/<kbd>→</kbd> button right after pressing enter, you can delete/append the next few sentences of the article to the Text Editor. Pressing <kbd>enter</kbd> or <kbd>space</kbd> would mean pasting the final text to the system.

After the participant is satisfied with the text entered in the text editor, pressing the **Next Task** button will load the next trial with its respective conditions.

Please remember to give the user a few non-timed trial sessions to familiarize themselves with the interface. Also, there should be a short minute break in the middle of the experiment.

After completing the experiment, the data containing the conditions and results of the trials will be generated in the form of a CSV file, `acp-<pid>-trials.csv`.


##### Post-Experiment Questionnaire Screen

Path: `questionnaire-post.html`.

Similar to the Pre-Experiment Questionnaire, in this screen, you will collect participants responses. However, unlike the Pre-Experiment Questionnaire, over here, you want to collect more qualitative and quantitative feedback about the tested techniques. Some of the typical questions include, personal preferences, any difficulties participants experienced in the experiment, and areas of improvement.

Please design a basic post-experimental questionnaire to help you to provide more in-depth information about the trade-offs between the tested techniques.

Upon clicking the Submit button, form responses on the page is serialized and CSV file containing the responses will be generated and available for downloading into the user's computer. The CSV file will be named `acp-<pid>-post.csv`.

### Credits

- Tay Yang Shun
- Wong Yong Jie
