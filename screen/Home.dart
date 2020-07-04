import 'package:flutter/material.dart';


class Home extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => _HomeState();
  
}

class _HomeState extends State<Home> {
  
  @override
  Widget build(BuildContext context) {
    return Material(
        child: Container(
          width: MediaQuery.of(context).size.width,
          height: MediaQuery.of(context).size.height * .1,
          decoration: BoxDecoration(color: Color(0xffF7EEDB)),
        ),
        );
  }
}
