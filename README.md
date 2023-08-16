# Workshop 4

[See the tutorial here.](https://tgdwyer.github.io/asteroids/)

Exercises are in src directory.

Setup (requires node.js):
```
> npm install
```

Start tests:
```
> npm test
```

Serve up the App (and ctrl-click the URL that appears in the console)
```
> npm run dev
```

## VS Code Live Share Instructions

For the workshop this week we will be working in groups again but this time using VS Code and the Live Share extension to complete the activity.  To install Live Share in VS code, open it up and click on the extensions button in the left

![Extensions button location](img/extensionsbutton.png)

The "Extensions Marketplace" will open up.  Type "live share" in the search box, and click the install button when it shows up in the results.

![live share marketplace](img/livesharemarketplace.png)

After that, a button will appear in the bottom left of your VS Code window

![live share marketplace](img/livesharenotification.png)


After that you'll have to sign-in via a windows or github account. Then, you'll get a notification in the bottom right and you'll have a link which you can share with your teammates via email in your clipboard.

![link copied notification](img/sharelink.png)

## Sharing the web server

You can also share your web server, as follows. Open package.json, where it says:
```
    "dev": "vite",
```
change to:

```
    "dev": "vite --host",
```
Then when you run:
```
> npm run dev
```
You may get a notification to allow it through the firewall (click "yes"). Then on the console you will see an IP address appear for the server.

Last thing you need to do is click the share button:

![share button](img/liveshareicon.png)

And enter the port number for the server (the part after the `:` in the server address you see on the console).
Then you can share the server IP address with your group-mates and they'll be able to see the development page.
