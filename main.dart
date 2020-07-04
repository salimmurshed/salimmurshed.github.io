import 'package:flutter/material.dart';
import 'package:salimmurshed/screen/Home.dart';


void main() {
  runApp(new MaterialApp(
      home: RunApp(),
      debugShowCheckedModeBanner: false
      ),
         );
}
class RunApp extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => _RunAppPageState();
  
}

class _RunAppPageState extends State<RunApp> {
  
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        home: Home()
        );
  }
}
