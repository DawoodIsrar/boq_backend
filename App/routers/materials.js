const express = require("express");
const db = require("../models");
const users = db.users;
const projects = db.projects;
const materials = db.material;
const router = express.Router();
const jsonwebtoken = require("jsonwebtoken");
const config = require("../config/auth.config");
const material = router.post("/materials", verifyToken, async (req, res) => {
  try {
    let allow;
    jsonwebtoken.verify(req.token, config.secret, (err, authData) => {
      if (err) {
        allow = false;
        console.log("allow token:" + allow);
        return res.status(401).send("invalid token");
      } else {
        allow = true;
        console.log("allow token:" + allow);
      }
    });

    if (allow == true) {
      console.log("allow token:" + allow);
      const exist = await projects.findOne({
        where: {
          name: req.body.name,
        },
      });
      console.log(exist);
      if (exist == null) {
        try {
          //=======================(Step-1)=============================//
          //setting all the require dimensions for material estimation  //
          //============================================================//
          //getting all values which user provide us                    //
          const total_surface_area = req.body.area;
          const no_of_roofs = req.body.no_of_roofs;
          const rooms = req.body.rooms;
          const room_size = req.body.avg_room_size;
          let surface_area_of_piller;
          let piller;
          let piller_length;
          let beams;
          let total_beams_and_pillers_area;
          let no_of_pillars_beams;
          //calculating ideal washrooom size and hall according to area total
          let bathroom_size;
          let hall_size;
          // ideal size of remaining thing by defualt
          if (total_surface_area <= 1000 || total_surface_area <= 2000) {
            //supposing 5x6 ideal size
            bathroom_size = 30;
            //supposing 9x10 feet ideal size
            hall_size = 90;
          } else if (total_surface_area > 2000 || total_surface_area <= 3000) {
            //supposing 6x7 ideal size
            bathroom_size = 42;
            //supposing 10x11 feet ideal size
            hall_size = 110;
          } else if (total_surface_area > 3000 || total_surface_area <= 4000) {
            //supposing 7x8 ideal size
            bathroom_size = 56;
            //supposing 11x12 feet ideal size
            hall_size = 132;
          } else if (total_surface_area > 4000 || total_surface_area <= 5000) {
            //supposing 8x9 ideal size
            bathroom_size = 72;
            //supposing 12x13 feet ideal size
            hall_size = 156;
          } else if (total_surface_area > 5000) {
            //supposing 9x10 ideal size
            bathroom_size = 90;
            //supposing 13x14 feet ideal size
            hall_size = 182;
          }
          console.log("hall size from the condition", +hall_size);
          if (req.body.kitchen != false && req.body.kitchen_size != null) {
            //surface area formula for piller = Surface area = 2lw + 2lh + 2wh
            surface_area_of_piller = 24.75;
            beams = 4 * (req.body.rooms + 1 + 1) - 2;
            beams_size_kitchen = Math.sqrt(req.body.kitchen_size);
            beams_size_hall = Math.sqrt(hall_size);
            beams_size_room = Math.sqrt(req.body.rooms);

            total_beams_area =
              beams *
              (2 * (0.75 * 1) +
                beams_size_kitchen * (0.75 + 1) +
                (2 * (0.75 * 1) + beams_size_hall * (0.75 + 1)) +
                (2 * (0.75 * 1) + beams_size_room * (0.75 + 1)));
            piller = 4 * (req.body.rooms + 1 + 1) * surface_area_of_piller;
            total_beams_and_pillers_area = piller + total_beams_area;

            no_of_pillars_beams = beams + 4 * (req.body.rooms + 1 + 1);
          } else {
            piller = 4 * (req.body.rooms + 1) * 24.75;
            beams = 4 * (req.body.rooms + 1 + 1) - 2;
            beams_size_kitchen = Math.sqrt(req.body.kitchen_size);
            beams_size_hall = Math.sqrt(hall_size);
            beams_size_room = Math.sqrt(req.body.rooms);
            total_beams_area =
              beams *
              (2 * (0.75 * 1) +
                beams_size_hall * (0.75 + 1) +
                (2 * (0.75 * 1) + beams_size_room * (0.75 + 1)));
            total_beams_and_pillers_area = piller + total_beams_area;
            no_of_pillars_beams = beams + 4 * (req.body.rooms + 1);
          }

          //=======================(Step-2)===========================//
          //                 material estimation                      //
          //==========================================================//
          //============(Required parameters)=========================//
          //room parameters
          let total_room_bricks = 0;
          let total_room_cements = 0;
          let total_room_sand = 0;
          let roomsArea = 0;
          //washroom parameter
          let washroom_total_room_bricks = 0;
          let washroom_total_cements = 0;
          let washroom_sand = 0;
          let washroomArea = 0;
          //kitchen parameter
          let kitchen_total_room_bricks = 0;
          let kitchen_total_room_cements = 0;
          let kitchen_sand = 0;
          let kitchenArea = 0;
          //hall parameter
          let hall_bricks = 0;
          let hall_cement = 0;
          let hall_sand = 0;
          let bricks;
          let cement;
          let pillars_beams;
          let material_of_pillars_beams;
          let roof_materials;
          //==========================================================//
          //first calculate the boundary wall calculation
          //required parameter => total surface area of wall - surface area of main gate

          //function for calculating total number of brick by providing the total area and length of gate
          const cal_wall = (main_gate, total_surface_area, window) => {
            let value = Math.sqrt(total_surface_area);

            let boundry = 2 * (value + value) * 10; //480
            console.log("square root:", +value);
            let total_boundry = boundry - main_gate - window; //432
            //let assuming total surface area of one brick is 8x4 in inches without mortar 9x4.5x3 = 121.5
            //volume of one brick without brick 9x4.5x3 m^3
            let brick_size_one = 40.5;
            //mortar ideal thickness
            let mortar = 0.5;
            //ratio of cement and sand in mortar
            let sandRatio = 6;
            let cementRatio = 1;
            //convert the area in feet to square inches
            let volume_of_wall = total_boundry * 0.75; //324
            //area of bricks with mortar 4x0.5+3x0.5+5x0.5
            let area_of_bricks_with_mortal = 17.5;
            //no of bricks with mortar
            let mortalBricks =
              (total_boundry * 144) / area_of_bricks_with_mortal; //2666
            console.log("no of bricks with mortar:" + mortalBricks);
            //volume of only brick in wall 121.5*823
            let onlyVolumeOfBricks = brick_size_one * mortalBricks;
            console.log("volume of only bricks in wall:" + onlyVolumeOfBricks);
            //now lets convert it to cf cubic feets
            let bricksCF = onlyVolumeOfBricks / 1728;
            //now lets subtract it from total area for calculating mortal volume only
            let mortarvolume = volume_of_wall - bricksCF;
            console.log("volume of mortar:" + mortarvolume);
            //convert volume of mortar into cm with ideal 35.3147
            let volumeMortalInCm = mortarvolume / 35.3147;
            // dry mortal ratio 33% and ratio is 1:6 sum of ratio is 7
            let dryMortar = volumeMortalInCm * 1.33;
            // now cement volume 1 ratio
            let cementVolume = (1 / 7) * dryMortar;
            console.log("volume of cement in mortar:" + cementVolume);
            //1m^3 consume 28.8 cubic volume of cement by 1m^3= 1440/50
            let cementBags = cementVolume * 28.8;
            console.log("cement bags:" + cementBags);
            //now sand volume
            let sandVolume = (6 / 7) * dryMortar;
            console.log("volum of sand in mortar:" + sandVolume);
            //sand total volume
            let totalSandVolume = sandVolume * 35.314;
            console.log(
              "total volume in cubic feet of sand:" + totalSandVolume
            );
            console.log(
              "===================================================================================================="
            );
            //total no of bricks for wall
            return {
              bricks: mortalBricks,
              cement_bags: cementBags,
              sand: totalSandVolume,
            };
          };
          //assuming ideal 6x8 feet gate size => 48
          //   const boundry_Wall_bricks = cal_brick(48, total_surface_area, 0);
          //   console.log("Boundary wall total bricks:" + boundry_Wall_bricks);

          //=====================================================================================//
          //now lets move on towards the calculations cement,sand,concrete and steel for slab
          //if following M5 method 1:4:8
          const cal_slab_M5 = (total_surface_area) => {
            //considering 5 inches /12 convert it to cf
            let thickness = 0.4166;
            let total_boundry = total_surface_area;
            //calculate net volume in cubic feet
            let totalCubicFeets = total_boundry * thickness;
            console.log("total cubic feet with thickness:" + totalCubicFeets);
            // dry volumn 56%

            let dryVolume = totalCubicFeets * 1.54;
            console.log("dry volume:" + dryVolume);
            // ratio of cement sand and slab 1+2+4 = 7
            let volumeOfCement = (1 / 13) * dryVolume;
            //1 cement bag in cubic concrete = 1.25
            let cementBags = volumeOfCement / 1.25;
            console.log("cement bags:" + cementBags);
            // ratio of cement sand and concrete 1+2+4 = 7
            let volumeOfSand = (4 / 13) * dryVolume;
            // ratio of concrete sand and concrete 1+2+4 = 7
            let volumeOfConcrete = (8 / 13) * dryVolume;
            console.log("sand volume in cubic feet:" + volumeOfConcrete);
            //slab iron quntity
            let slab = total_boundry / 35.3147;
            //80kg
            let totalSlab = slab * 80;
            console.log("slab in cubic feet:" + totalSlab);
            return {
              cement_bags: cementBags,
              sand: volumeOfSand,
              concrete: volumeOfConcrete,
              steel: totalSlab,
            };
          };
          //if following M10 method 1:3:6
          const cal_slab_M10 = (total_surface_area) => {
            //considering 5 inches /12 convert it to cf
            let thickness = 0.4166;
            let total_boundry = total_surface_area;
            //calculate net volume in cubic feet
            let totalCubicFeets = total_boundry * thickness;
            console.log("total cubic feet with thickness:" + totalCubicFeets);
            // dry volumn 56%

            let dryVolume = totalCubicFeets * 1.54;
            console.log("dry volume:" + dryVolume);
            // ratio of cement sand and slab 1+2+4 = 7
            let volumeOfCement = (1 / 10) * dryVolume;
            //1 cement bag in cubic concrete = 1.25
            let cementBags = volumeOfCement / 1.25;
            console.log("cement bags:" + cementBags);
            // ratio of cement sand and concrete 1+2+4 = 7
            let volumeOfSand = (3 / 10) * dryVolume;
            // ratio of concrete sand and concrete 1+2+4 = 7
            let volumeOfConcrete = (6 / 10) * dryVolume;
            console.log("sand volume in cubic feet:" + volumeOfConcrete);
            //slab iron quntity
            let slab = total_boundry / 35.3147;
            //80kg
            let totalSlab = slab * 80;
            console.log("slab in cubic feet:" + totalSlab);
            return {
              cement_bags: cementBags,
              sand: volumeOfSand,
              concrete: volumeOfConcrete,
              steel: totalSlab,
            };
          };
          //if following M15 method 1:2:4
          const cal_slab_M15 = (total_surface_area) => {
            //considering 5 inches /12 convert it to cf
            let thickness = 0.4166;
            let total_boundry = total_surface_area;
            //calculate net volume in cubic feet
            let totalCubicFeets = total_boundry * thickness;
            console.log("total cubic feet with thickness:" + totalCubicFeets);
            // dry volumn 56%

            let dryVolume = totalCubicFeets * 1.54;
            console.log("dry volume:" + dryVolume);
            // ratio of cement sand and slab 1+2+4 = 7
            let volumeOfCement = (1 / 7) * dryVolume;
            //1 cement bag in cubic concrete = 1.25
            let cementBags = volumeOfCement / 1.25;
            console.log("cement bags:" + cementBags);
            // ratio of cement sand and concrete 1+2+4 = 7
            let volumeOfSand = (2 / 7) * dryVolume;
            // ratio of concrete sand and concrete 1+2+4 = 7
            let volumeOfConcrete = (4 / 7) * dryVolume;
            console.log("sand volume in cubic feet:" + volumeOfConcrete);
            //slab iron quntity
            let slab = total_boundry / 35.3147;
            //80kg
            let totalSlab = slab * 80;
            console.log("slab in cubic feet:" + totalSlab);
            console.log(
              "===================================================================================================="
            );
            return {
              cement_bags: cementBags,
              sand: volumeOfSand,
              concrete: volumeOfConcrete,
              steel: totalSlab,
            };
          };
          //if following M20 method 1:1.5:3
          const cal_slab_M20 = (total_surface_area) => {
            //considering 5 inches /12 convert it to cf
            let thickness = 0.4166;
            let total_boundry = total_surface_area;
            //calculate net volume in cubic feet
            let totalCubicFeets = total_boundry * thickness;
            console.log("total cubic feet with thickness:" + totalCubicFeets);
            // dry volumn 56%

            let dryVolume = totalCubicFeets * 1.54;
            console.log("dry volume:" + dryVolume);
            // ratio of cement sand and slab 1+2+4 = 7
            let volumeOfCement = (1 / 5.5) * dryVolume;
            //1 cement bag in cubic concrete = 1.25
            let cementBags = volumeOfCement / 1.25;
            console.log("cement bags:" + cementBags);
            // ratio of cement sand and concrete 1+2+4 = 7
            let volumeOfSand = (1.5 / 5.5) * dryVolume;
            // ratio of concrete sand and concrete 1+2+4 = 7
            let volumeOfConcrete = (3 / 5.5) * dryVolume;
            console.log("sand volume in cubic feet:" + volumeOfConcrete);
            //slab iron quntity
            let slab = total_boundry / 35.3147;
            //80kg
            let totalSlab = slab * 80;
            console.log("slab in cubic feet:" + totalSlab);
            return {
              cement_bags: cementBags,
              sand: volumeOfSand,
              concrete: volumeOfConcrete,
              steel: totalSlab,
            };
          };
          //if following M25 method 1:1:2
          const cal_slab_M25 = (total_surface_area) => {
            //considering 5 inches /12 convert it to cf
            let thickness = 0.4166;
            let total_boundry = total_surface_area;
            //calculate net volume in cubic feet
            let totalCubicFeets = total_boundry * thickness;
            console.log("total cubic feet with thickness:" + totalCubicFeets);
            // dry volumn 56%

            let dryVolume = totalCubicFeets * 1.54;
            console.log("dry volume:" + dryVolume);
            // ratio of cement sand and slab 1+2+4 = 7
            let volumeOfCement = (1 / 4) * dryVolume;
            //1 cement bag in cubic concrete = 1.25
            let cementBags = volumeOfCement / 1.25;
            console.log("cement bags:" + cementBags);
            // ratio of cement sand and concrete 1+2+4 = 7
            let volumeOfSand = (1 / 4) * dryVolume;
            // ratio of concrete sand and concrete 1+2+4 = 7
            let volumeOfConcrete = (2 / 4) * dryVolume;
            console.log("sand volume in cubic feet:" + volumeOfConcrete);
            //slab iron qauntity
            let slab = total_boundry / 35.3147;
            //80kg
            let totalSlab = slab * 80;
            console.log("slab in cubic feet:" + totalSlab);
            return {
              cement_bags: cementBags,
              sand: volumeOfSand,
              concrete: volumeOfConcrete,
              steel: totalSlab,
            };
          };

          //========================================================================================//
          //now lets calculate the material of room
          if (
            (req.body.rooms != 0 && req.body.avg_room_size != 0) ||
            (req.body.rooms != null && req.body.avg_room_size != null)
          ) {
            let oneRoomSize = req.body.avg_room_size;
            //assuming 36x80 inches which is 20 feet
            let roomDoor = 18;
            //assuming 4x2  which is 8 feet
            let roomWindow = 8;
            let roomWall = cal_wall(roomDoor, oneRoomSize, roomWindow);

            total_room_bricks = roomWall.bricks * req.body.rooms;
            total_room_cements = roomWall.cement_bags * req.body.rooms;
            total_room_sand = roomWall.sand * req.body.rooms;
            roomsArea = oneRoomSize * req.body.rooms;
            console.log(
              "==========================================(rooms material)======================================"
            );
            console.log(
              `area by all room:${roomsArea} bricks for room: ${total_room_bricks} and cement bags required:${total_room_cements}  and sand:${total_room_sand}`
            );
            console.log(
              "===================================================================================================="
            );
          } else {
            return res.status(500).json({
              message: "Sorry room no and size of must be mentioned.",
            });
          }
          //=========================================================================================//
          //now lets calculate the material of bathrooms
          //========================================================================================//
          if (req.body.attach_bath == true) {
            //now lets calculate the material of  washroom
            //by default ideal size is 5x6 which is 30 feet
            let oneWashroomSize;
            if (
              req.body.attach_bath_size == null ||
              req.body.attach_bath_size == 0
            ) {
              oneWashroomSize = bathroom_size;
            } else {
              oneWashroomSize = req.body.attach_bath_size;
            }
            //assuming 36x80 inches which is 16 feet
            let oneWashroomDoor = 16;
            //assuming 4x2 ideally
            let oneWashroomWindow = 8;
            let washroomWall = cal_wall(
              oneWashroomDoor,
              oneWashroomSize,
              oneWashroomWindow
            );

            washroom_total_room_bricks = washroomWall.bricks * req.body.rooms;
            washroom_total_cements = washroomWall.cement_bags * req.body.rooms;
            washroom_sand = washroomWall.sand * req.body.rooms;
            washroomArea = oneWashroomSize * req.body.rooms;
            console.log(
              "=========================================(Washroom material)======================================="
            );
            console.log(
              `area:${washroomArea}  and bricks for washroom: ${washroom_total_room_bricks} and cement bags required:${washroom_total_cements} and sand:${washroom_sand}`
            );
            console.log(
              "===================================================================================================="
            );
          } else {
            console.log("attached bath are not included");
          }
          //=========================================================================================//
          //=========================================================================================//
          //now lets calculate the material of kitchen
          //========================================================================================//
          if (req.body.kitchen == true) {
            //now lets calculate the material of  washroom
            //by default ideal size is 10*12 which is 30 feet
            let kitchen_size;
            if (req.body.kitchen_size == null) {
              //by default 10x120
              kitchen_size = 120;
            } else {
              kitchen_size = req.body.kitchen_size;
            }
            //assuming 36x80 inches which is 16 feet
            let kitchenDoor = 16;
            //assuming average 3x4 window
            let kitchen_window = 12;
            let kitchenWall = cal_wall(
              kitchenDoor,
              kitchen_size,
              kitchen_window
            );

            kitchen_total_room_bricks =
              kitchenWall.bricks * req.body.no_of_roofs;
            kitchen_total_room_cements =
              kitchenWall.cement_bags * req.body.no_of_roofs;
            kitchen_sand = kitchenWall.sand * req.body.no_of_roofs;
            kitchenArea = kitchen_size;
            console.log(
              "==========================================(Kitchens material)======================================"
            );
            console.log(
              `area:${kitchenArea}  bricks for kitchen: ${kitchen_total_room_bricks} and cement bags required:${kitchen_total_room_cements} and sand:${kitchen_sand}`
            );
            console.log(
              "===================================================================================================="
            );
          }
          //=========================================================================================//
          console.log("hall size" + hall_size);
          let total_area_by_reserved =
            roomsArea + washroomArea + kitchenArea + hall_size;
          let total_area_remains_for_hall;
          if (total_area_by_reserved > req.body.area) {
            return res.status(500).json({
              message:
                "sorry you have enter incorrect total area the parameter that you have require exceed the total area limits ",
            });
          }
          total_area_remains_for_hall = req.body.area - total_area_by_reserved;
          let remaining_area = total_area_remains_for_hall - hall_size;
          //assuming main door 30x80 =>2400 inches => approx 17 sq feet
          let hall_door = 17;
          //assuming 4x3
          let hall_window = 12;
          let hall_wall = cal_wall(hall_door, hall_size, hall_window);
          hall_bricks = hall_wall.bricks;
          hall_cement = hall_wall.cement_bags;
          hall_sand = hall_wall.sand;
          console.log(
            "==========================================(Hall material)======================================"
          );
          console.log(
            `area:${hall_size}  bricks for hall: ${hall_bricks} and cement bags required:${hall_cement} and sand:${hall_sand}`
          );
          console.log(
            "===================================================================================================="
          );
          let total_area_under_roof =
            roomsArea + washroomArea + kitchenArea + hall_size;
          //=============================================================================//
          let roof;
          let roofCement;
          let roofSand;
          let roofConcrete;
          let steel;
          let pillers_beam;
          if (req.body.ratio != null) {
            if (req.body.ratio === "M5" || req.body.ratio === "m5") {
              //======================(total material by using M5 for roof material which 1:2:4)=======================================//
              roof = cal_slab_M5(total_area_under_roof);
              pillers_beam = cal_slab_M5(total_beams_and_pillers_area);

              roofCement = roof.cement_bags + pillars_beams.cement_bags;
              roofSand = roof.sand + pillars_beams.sand;
              roofConcrete =
                roof.concrete.toFixed() + pillars_beams.concrete.toFixed();
              steel = roof.steel.toFixed();
            } else if (req.body.ratio === "M10" || req.body.ratio === "m10") {
              roof = cal_slab_M10(total_area_under_roof);
              pillers_beam = cal_slab_M10(total_beams_and_pillers_area);

              roofCement = roof.cement_bags + pillars_beams.cement_bags;
              roofSand = roof.sand + pillars_beams.sand;
              roofConcrete =
                roof.concrete.toFixed() + pillars_beams.concrete.toFixed();
              steel = roof.steel.toFixed();
            } else if (req.body.ratio === "M15" || req.body.ratio === "m15") {
              roof = cal_slab_M15(total_area_under_roof);
              pillers_beam = cal_slab_M15(total_beams_and_pillers_area);

              roofCement = roof.cement_bags + pillars_beams.cement_bags;
              roofSand = roof.sand + pillars_beams.sand;
              roofConcrete =
                roof.concrete.toFixed() + pillars_beams.concrete.toFixed();
              steel = roof.steel.toFixed();
              console.log(
                "slab materail:",
                roofCement,
                roofSand,
                roofConcrete,
                steel
              );
            } else if (req.body.ratio === "M20" || req.body.ratio === "m20") {
              roof = cal_slab_M20(total_area_under_roof);
              pillers_beam = cal_slab_M20(total_beams_and_pillers_area);

              roofCement = roof.cement_bags + pillars_beams.cement_bags;
              roofSand = roof.sand + pillars_beams.sand;
              roofConcrete =
                roof.concrete.toFixed() + pillars_beams.concrete.toFixed();
              steel = roof.steel.toFixed();
            } else if (req.body.ratio === "M25" || req.body.ratio === "m25") {
              pillers_beam = cal_slab_M25(total_beams_and_pillers_area);

              roofCement = roof.cement_bags + pillars_beams.cement_bags;
              roofSand = roof.sand + pillars_beams.sand;
              roofConcrete =
                roof.concrete.toFixed() + pillars_beams.concrete.toFixed();
              steel = roof.steel.toFixed();
            }
          }
          let totalBricks = (
            total_room_bricks +
            washroom_total_room_bricks +
            kitchen_total_room_bricks +
            hall_bricks
          ).toFixed();
          let totalCement = (
            total_room_cements +
            washroom_total_cements +
            kitchen_total_room_cements +
            hall_cement +
            roofCement
          ).toFixed();
          let totalSand = (
            total_room_sand +
            washroom_sand +
            kitchen_sand +
            hall_sand +
            roofSand
          ).toFixed();
          return res.status(200).json({
            Total_number_of_bricks: totalBricks,
            Total_number_of_cement_bags: totalCement,
            Total_volumn_of_sand: totalSand,
            Total_kilograms_of_steel: steel,
            Total_concrete_volumn: roofConcrete,
          });

          if (exist == null) {
            try {
              console.log(
                "=======================(req body)======================================================"
              );
              console.log(req.body.name),
                console.log(req.body.area),
                console.log(req.body.no_of_roofs),
                console.log(req.body.rooms),
                console.log(req.body.avg_room_size),
                console.log(req.body.attach_bath),
                console.log(washroomArea),
                console.log(req.body.kitchen),
                console.log(kitchenArea),
                console.log(req.body.u_id);
              if (req.body.attach_bath == true && req.body.kitchen == true) {
                await projects.create({
                  name: req.body.name,
                  area: req.body.area,
                  no_of_roofs: req.body.no_of_roofs,
                  rooms: req.body.rooms,
                  avg_room_size: req.body.avg_room_size,
                  attach_bath: req.body.attach_bath,
                  attach_bath_size: bathroom_size,
                  kitchen: req.body.kitchen,
                  kitchen_size: kitchenArea,
                  u_id: req.body.u_id,
                });

                try {
                  const p = await projects.findOne({
                    where: {
                      name: req.body.name,
                    },
                  });
                  console.log();
                  console.log("project id" + p.id);

                  for (let i = 1; i <= req.body.no_of_roofs; i++) {
                    await materials.create({
                      roof_no: i,
                      area: req.body.area,
                      rooms: req.body.rooms,
                      avg_room_size: req.body.avg_room_size,
                      attach_bath: req.body.attach_bath,
                      attach_bath_size: bathroom_size,
                      kitchen: req.body.kitchen,
                      kitchen_size: kitchenArea,
                      lounge_hall_size: hall_size,
                      total_bricks: totalBricks,
                      total_cement: totalCement,
                      total_beams_pillars: no_of_pillars_beams,
                      total_steel: steel,
                      total_sand: totalSand,
                      total_concrete: roofConcrete,
                      p_id: p.id,
                    });
                  }
                  return res.status(201).json({
                    Building_total_bricks: totalBricks,
                    Building_total_cement_bags: totalCement,
                    Building_total_san_volumn: totalSand,
                    Building_total_concrete_volume: roofConcrete,
                    building_total_bemas_pillers: no_of_pillars_beams,
                    Building_total_steel: steel,
                  });
                } catch (error) {
                  return res.status(500).send("material database error");
                }
              } else if (
                req.body.attach_bath === false &&
                req.body.kitchen === true
              ) {
                await projects.create({
                  name: req.body.name,
                  area: req.body.area,
                  no_of_roofs: req.body.no_of_roofs,
                  rooms: req.body.rooms,
                  avg_room_size: req.body.avg_room_size,
                  attach_bath: req.body.attach_bath,
                  attach_bath_size: 0,
                  kitchen: req.body.kitchen,
                  kitchen_size: kitchenArea,
                  u_id: req.body.u_id,
                });

                try {
                  const p = await projects.findOne({
                    where: {
                      name: req.body.name,
                    },
                  });
                  console.log();
                  console.log("project id" + p.id);

                  for (let i = 1; i <= req.body.no_of_roofs; i++) {
                    // let pillerrs;
                    // if (req.body.kitchen == true) {
                    //   pillerrs = 4 * (req.body.rooms + 1 + 1);
                    // } else {
                    //   pillerrs = 4 * (req.body.rooms + 1);
                    // }
                    await materials.create({
                      roof_no: i,
                      area: req.body.area,
                      rooms: req.body.rooms,
                      avg_room_size: req.body.avg_room_size,
                      attach_bath: req.body.attach_bath,
                      attach_bath_size: 0,
                      kitchen: req.body.kitchen,
                      kitchen_size: kitchenArea,
                      lounge_hall_size: hall_size,
                      total_bricks: totalBricks,
                      total_cement: totalCement,
                      total_beams_pillars: no_of_pillars_beams,
                      total_steel: steel,
                      total_sand: totalSand,
                      total_concrete: roofConcrete,
                      p_id: p.id,
                    });
                  }
                  return res.status(201).json({
                    Building_total_bricks: totalBricks,
                    Building_total_cement_bags: totalCement,
                    Building_total_san_volumn: totalSand,
                    Building_total_concrete_volume: roofConcrete,
                    building_total_bemas_pillers: no_of_pillars_beams,
                    Building_total_steel: steel,
                  });
                } catch (error) {
                  return res.status(500).send("material database error");
                }
              } else if (
                req.body.attach_bath === false &&
                req.body.kitchen === false
              ) {
                await projects.create({
                  name: req.body.name,
                  area: req.body.area,
                  no_of_roofs: req.body.no_of_roofs,
                  rooms: req.body.rooms,
                  avg_room_size: req.body.avg_room_size,
                  attach_bath: req.body.attach_bath,
                  attach_bath_size: 0,
                  kitchen: req.body.kitchen,
                  kitchen_size: 0,
                  u_id: req.body.u_id,
                });

                try {
                  const p = await projects.findOne({
                    where: {
                      name: req.body.name,
                    },
                  });
                  console.log();
                  console.log("project id" + p.id);

                  for (let i = 1; i <= req.body.no_of_roofs; i++) {
                    // let pillerrs;
                    // if (req.body.kitchen == true) {
                    //   pillerrs = 4 * (req.body.rooms + 1 + 1);
                    // } else {
                    //   pillerrs = 4 * (req.body.rooms + 1);
                    // }
                    // console.log(i,req.body.area,req.body.rooms,req.body.avg_room_size,req.body.attach_bath,0,req.body.kitchen,0,totalBricks,totalCement,totalSand,steel,roofConcrete)
                    await materials.create({
                      roof_no: i,
                      area: req.body.area,
                      rooms: req.body.rooms,
                      avg_room_size: req.body.avg_room_size,
                      attach_bath: false,
                      attach_bath_size: 0,
                      kitchen: false,
                      kitchen_size: 0,
                      lounge_hall_size: hall_size,
                      total_bricks: totalBricks,
                      total_cement: totalCement,
                      total_beams_pillars: no_of_pillars_beams,
                      total_steel: steel,
                      total_sand: totalSand,
                      total_concrete: roofConcrete,
                      p_id: p.id,
                    });
                  }
                  return res.status(201).json({
                    Building_total_bricks: totalBricks,
                    Building_total_cement_bags: totalCement,
                    Building_total_san_volumn: totalSand,
                    Building_total_concrete_volume: roofConcrete,
                    building_total_bemas_pillers: no_of_pillars_beams,
                    Building_total_steel: steel,
                  });
                } catch (error) {
                  return res.status(500).send("material database error");
                }
              } else if (
                req.body.attach_bath === true &&
                req.body.kitchen === false
              ) {
                await projects.create({
                  name: req.body.name,
                  area: req.body.area,
                  no_of_roofs: req.body.no_of_roofs,
                  rooms: req.body.rooms,
                  avg_room_size: req.body.avg_room_size,
                  attach_bath: req.body.attach_bath,
                  attach_bath_size: req.body.attach_bath_size,
                  kitchen: req.body.kitchen,
                  kitchen_size: 0,
                  u_id: req.body.u_id,
                });

                try {
                  const p = await projects.findOne({
                    where: {
                      name: req.body.name,
                    },
                  });
                  console.log();
                  console.log("project id" + p.id);

                  for (let i = 1; i <= req.body.no_of_roofs; i++) {
                    // let pillerrs;
                    // if (req.body.kitchen == true) {
                    //   pillerrs = 4 * (req.body.rooms + 1 + 1);
                    // } else {
                    //   pillerrs = 4 * (req.body.rooms + 1);
                    // }
                    // console.log(i,req.body.area,req.body.rooms,req.body.avg_room_size,req.body.attach_bath,0,req.body.kitchen,0,totalBricks,totalCement,totalSand,steel,roofConcrete)
                    await materials.create({
                      roof_no: i,
                      area: req.body.area,
                      rooms: req.body.rooms,
                      avg_room_size: req.body.avg_room_size,
                      attach_bath: req.body.attach_bath,
                      attach_bath_size: req.body.attach_bath_size,
                      kitchen: false,
                      kitchen_size: 0,
                      lounge_hall_size: hall_size,
                      total_bricks: totalBricks,
                      total_cement: totalCement,
                      total_beams_pillars: no_of_pillars_beams,
                      total_steel: steel,
                      total_sand: totalSand,
                      total_concrete: roofConcrete,
                      p_id: p.id,
                    });
                  }
                  return res.status(201).json({
                    Building_total_bricks: totalBricks,
                    Building_total_cement_bags: totalCement,
                    Building_total_san_volumn: totalSand,
                    Building_total_concrete_volume: roofConcrete,
                    building_total_bemas_pillers: no_of_pillars_beams,
                    Building_total_steel: steel,
                  });
                } catch (error) {
                  return res.status(500).send("material database error");
                }
              }
            } catch (error) {
              return res.status(500).json({
                message: "error in the projects and  material database",
              });
            }
          }
        } catch (error) {
          return res.status(500).json(error);
        }
      } else {
        return res
          .status(500)
          .json({ message: "sorry the project name already existed" });
      }
    }
  } catch (error) {
    return res.status(500).send("internal server error");
  }
});

//verify token function
function verifyToken(req, res, next) {
  var bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    req.token = token;
    console.log("from function" + req.token);
    next();
  } else {
    return res.status(401).send("ivalid token");
  }
}
module.exports = material;
