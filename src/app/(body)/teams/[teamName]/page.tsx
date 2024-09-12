


// We want: Expected Wins 
// How expected wins have changed over time 
// Playoff odds 
// Division odds
// Conference odds
// Schedule and results 

import Image from "next/image";




const formatTeamName = (team: string) => team.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

const Page = async (
  { params }: {
    params: { teamName: string }
  }) => {

  const teamName = formatTeamName(params.teamName ?? '');

  if (!teamName) {
    return (
      <div>
        <p>Team not found</p>
      </div>
    )
  }



  return (

    <div className="">
      <div className="flex items-center">
        <Image src={`/${formatTeamName(params.teamName)}.png`} width={50} height={50} alt={teamName} />
        <p className="text-3xl ml-4">{teamName}</p>
      </div>
      {/* <hr className="my-8" /> */}
    </div>

  )
}

export default Page