

// interface DivisionProps {
//   divisionName: string;
//   teams: {
//     teamname: string;
//     wins: number;
//     losses: number;
//     ties: number;
//     divisionWinProbabiltiy?: number;
//   }[]
// }


// const testData: DivisionProps = {
//   divisionName: "NFC East",
//   teams: [
//     {
//       "teamname": "Philadelphia Eagles",
//       "wins": 12,
//       "losses": 5,
//       "ties": 0,
//       "divisionWinProbabiltiy": 0.6
//     },
//     {
//       "teamname": "Dallas Cowboys",
//       "wins": 10,
//       "losses": 7,
//       "ties": 0,
//       "divisionWinProbabiltiy": 0.25
//     },
//     {
//       "teamname": "Washington Commanders",
//       "wins": 8,
//       "losses": 8,
//       "ties": 1,
//       "divisionWinProbabiltiy": 0.10
//     },
//     {
//       "teamname": "New York Giants",
//       "wins": 8,
//       "losses": 9,
//       "ties": 0,
//       "divisionWinProbabiltiy": 0.05
//     }
//   ]
// }
// export const Division = (props: DivisionProps) => {

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>
//           {props.divisionName}
//         </CardTitle>

//       </CardHeader>
//       <CardContent>
//         {props.teams.map((team, i) => {

//           const display_name = team.teamname.split(" ").pop()
//           const display_probability = (team.divisionWinProbabiltiy ?? 0 * 100).toFixed(1)
//           return (
//             <div key={i} className="flex items-center w-full" >
//               <div className="font-bold flex justify-center items-center pr-4">{i + 1}</div>
//               <Image src={`/${team.teamname}.png`} alt={team.teamname} width={35} height={35} />
//               <div className="flex w-full items-center justify-between pl-4">
//                 <div className="flex gap-3 ">
//                   <div className="text-lg font-bold">{display_name}</div>
//                   <div className="text-muted-foreground">{team.wins}-{team.losses}{team.ties > 0 ? "-" + team.ties : ""}</div>
//                 </div>
//                 {team.divisionWinProbabiltiy && <Badge variant='secondary'>{display_probability}%</Badge>}
//               </div>
//             </div>
//           )


//         })}
//       </CardContent>

//     </Card>
//   )
// }


const StandingsByDivision = () => {


  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        {`Division Standings`}
      </h1>
    </div>
  )
}

export default StandingsByDivision