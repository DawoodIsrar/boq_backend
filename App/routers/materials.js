const express = require("express");
const db = require("../models");

const router = express.Router();
const material = router.post("/materials", async (req, res) => {
  //    const exist= material.findOne({
  //         where:{
  //             project_name:req.body.project_name
  //         }
  //     })
  try {
  
      //=======================(Step-1)============================//
      //setting all the require dimensions for material estimation
      //==========================================================//
      //getting all values which user provide us
      const total_surface_area = req.body.area;
      const no_of_roofs = req.body.no_of_roofs;
      const rooms = req.body.rooms;
      const room_size = req.body.avg_room_size;
      //calculating ideal washrooom size and hall according to area total
      let bathroom_size;
      let hall_size;
      // ideal size of remaining thing by defualt
      if (total_surface_area >= 1000 && total_surface_area <= 2000) {
        //supposing 5x6 ideal size
        bathroom_size = 30;
        //supposing 9x10 feet ideal size
        hall_size = 90;
      } else if (total_surface_area > 2000 && total_surface_area <= 3000) {
        //supposing 6x7 ideal size
        bathroom_size = 42;
        //supposing 10x11 feet ideal size
        hall_size = 110;
      } else if (total_surface_area > 3000 && total_surface_area <= 4000) {
        //supposing 7x8 ideal size
        bathroom_size = 56;
        //supposing 11x12 feet ideal size
        hall_size = 132;
      } else if (total_surface_area > 4000 && total_surface_area <= 5000) {
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
      //=======================(Step-2)============================//
      //                 material estimation
      //==========================================================//
      //============(Required parameters)=========================//
      //room parameters
      let total_room_bricks;
        let total_room_cements ;
        let total_room_sand;
        let roomsArea ;
    //washroom parameter
    let washroom_total_room_bricks;
    let washroom_total_cements ;
    let washroom_sand ;
    let washroomArea ;
    //kitchen parameter
    let kitchen_total_room_bricks ;
        let kitchen_total_room_cements;
        let kitchen_sand ;
        let kitchenArea ;
    //hall parameter
    let hall_bricks ;
    let hall_cement ;
    let hall_sand ;
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
        let total_boundry = total_surface_area - main_gate - window;
        //let assuming total surface area of one brick is 8x4 in inches without mortar 9x4.5x3 = 121.5
        //volume of one brick without brick 9x4.5x3 m^3
        let brick_size_one = 121.5; // in  inches
        //mortar ideal thickness
        let mortar = 0.5;
        //ratio of cement and sand in mortar
        let sandRatio = 6;
        let cementRatio = 1;
        //convert the area in feet to square inches
        let volume_of_wall = total_boundry * 0.75;
        //area of bricks with mortar 4x0.5+3x0.5+5x0.5
        let area_of_bricks_with_mortal = 17.5;
        //no of bricks with mortar
        let mortalBricks = (total_boundry * 144) / area_of_bricks_with_mortal;
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
        console.log("total volume in cubic feet of sand:" + totalSandVolume);
        console.log("====================================================================================================")
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
      const cal_slab_M15 =  (total_surface_area) => {
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
        console.log("====================================================================================================")
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

      //========================================================================================//
      //now lets calculate the material of room
      if (req.body.rooms != 0 && req.body.avg_room_size != 0 || req.body.rooms != undefine && req.body.avg_room_size != undefine) {
        let oneRoomSize = req.body.avg_room_size;
        //assuming 36x80 inches which is 20 feet
        let roomDoor = 18;
        //assuming 4x2  which is 8 feet
        let roomWindow = 8;
        let roomWall = cal_wall(roomDoor, oneRoomSize, roomWindow);

         total_room_bricks = roomWall.bricks * req.body.rooms;
         total_room_cements = roomWall.cement_bags * req.body.rooms;
         total_room_sand = roomWall.sand* req.body.rooms;
         roomsArea = oneRoomSize * req.body.rooms;
         console.log("==========================================(rooms material)======================================")
        console.log(
          `area by all room:${roomsArea} bricks for room: ${total_room_bricks} and cement bags required:${total_room_cements}  and sand:${total_room_sand}`
        );
        console.log("====================================================================================================")
      }else{
         return res.status(500).json({message:"Sorry room no and size of must be mentioned."})
      }
      //=========================================================================================//
      //now lets calculate the material of bathrooms
      //========================================================================================//
      if (req.body.attach_bath == true) {
        //now lets calculate the material of  washroom
        //by default ideal size is 5x6 which is 30 feet
        let oneWashroomSize;
        if (req.body.attach_bath_size == null || req.body.attach_bath_size == undefine) {
          oneWashroomSize = 30;
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
         console.log("=========================================(Washroom material)=======================================")
        console.log(
          `area:${washroomArea}  and bricks for washroom: ${washroom_total_room_bricks} and cement bags required:${washroom_total_cements} and sand:${washroom_sand}`

        );
        console.log("====================================================================================================")
      }else{
        console.log("attached bath are not included")
       
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
        let kitchenWall = cal_wall(kitchenDoor, kitchen_size, kitchen_window);

         kitchen_total_room_bricks =
         kitchenWall.bricks * req.body.no_of_roofs;
         kitchen_total_room_cements =
          kitchenWall.cement_bags * req.body.no_of_roofs;
         kitchen_sand = kitchenWall.sand * req.body.no_of_roofs;
         kitchenArea = kitchen_size;
         console.log("==========================================(Kitchens material)======================================")
        console.log(
          `area:${kitchenArea}  bricks for kitchen: ${kitchen_total_room_bricks} and cement bags required:${kitchen_total_room_cements} and sand:${kitchen_sand}`
        );
        console.log("====================================================================================================")
      }
      //=========================================================================================//
      let total_area_by_reserved = roomsArea + washroomArea + kitchenArea;
      let total_area_remains_for_hall;
      if (total_area_by_reserved > req.body.area) {
        return res
          .status(500)
          .json({
            message:
              "sorry you have enter incorrect total area the parameter that you have require exceed the total area",
          });
      } 
        total_area_remains_for_hall = req.body.area - total_area_by_reserved;
        //assuming main door 30x80 =>2400 inches => approx 17 sq feet
        let hall_door = 17;
        //assuming 4x3
        let hall_window = 12;
        let hall_wall = cal_wall(
          hall_door,
          total_area_remains_for_hall,
          hall_window
        );
         hall_bricks = hall_wall.bricks;
         hall_cement = hall_wall.cement_bags;
         hall_sand = hall_wall.sand;
         console.log("==========================================(Hall material)======================================")
         console.log(
           `area:${total_area_remains_for_hall}  bricks for kitchen: ${hall_bricks} and cement bags required:${hall_cement} and sand:${hall_sand}`
         );
         console.log("====================================================================================================")
        let total_area_under_roof =
          roomsArea + washroomArea + kitchenArea + total_area_remains_for_hall;
       //=============================================================================//
       //======================(total material)=======================================//
        let roof1 = cal_slab_M15(total_area_under_roof);
        let roofCement = roof1.cement_bags
        let roofSand = roof1.sand
        let roofConcrete = roof1.concrete
        let steel = roof1.steel
        let totalBricks = total_room_bricks+washroom_total_room_bricks+kitchen_total_room_bricks+hall_bricks
        let totalCement = total_room_cements+washroom_total_cements+kitchen_total_room_cements+hall_cement+roofCement
        let totalSand = total_room_sand+washroom_sand+kitchen_sand+hall_sand+roofSand
        res.status(200).json({
            total_Bricks:totalBricks,
            total_Cement:totalCement,
            total_sand:totalSand,
            total_concrete_for_slab:roofConcrete,
            total_steel:steel
        })
      
    
  } catch (error) {
    return res.status(500).json(error)
  }
});
module.exports = material;