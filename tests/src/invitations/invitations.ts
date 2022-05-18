import { Orchestrator, Player, Cell } from "@holochain/tryorama";
import { config, installation, sleep } from "../utils";
//import { CreateMewInput, FeedMew, Mew } from "../../../ui/src/types/types";
import { serializeHash } from "@holochain-open-dev/core-types";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const sendInvitation = (guest_pub_key) => (conductor) => conductor.call("invitations", "send_invitation", [guest_pub_key]);
const getPendingInvitations = (conductor) => conductor.call("invitations", "get_my_pending_invitations",);
const acceptInvitation = (invitation_entry_hash) =>(conductor) => conductor.call("invitations", "accept_invitation",invitation_entry_hash);
const clearInvitation = (invitation_entry_hash) =>(conductor) => conductor.call("invitations", "clear_invitation",invitation_entry_hash);
const rejectInvitation = (invitation_entry_hash) => (conductor) => conductor.call("invitations", "reject_invitation",invitation_entry_hash);
const getDetails = (invitation_entry_hash) => (conductor) => conductor.call("invitations", "my_get_details",invitation_entry_hash);


export default (orchestrator: Orchestrator<any>) =>
  orchestrator.registerScenario("invitations tests", async (s, t) => {
    // Declare two players using the previously specified config, nicknaming them "alice" and "bob"
    // note that the first argument to players is just an array conductor configs that that will
    // be used to spin up the conductor processes which are returned in a matching array.
    const [alice_player, bob_player]: Player[] = await s.players([
      config,
      config
    ]);

    // install your happs into the conductors and destructuring the returned happ data using the same
    // array structure as you created in your installation array.
    const [[alice_happ]] = await alice_player.installAgentsHapps(installation);
    const [[bob_happ]] = await bob_player.installAgentsHapps(installation);

    await s.shareAllNodes([alice_player, bob_player]);

    const alicePubKey = alice_happ.agent;
    const bobPubKey = bob_happ.agent;

    const alice = alice_happ.cells.find((cell) =>
      cell.cellRole.includes("/invitations.dna")
    ) as Cell;
    const bob = bob_happ.cells.find((cell) =>
      cell.cellRole.includes("/invitations.dna")
    ) as Cell;

    //let alice_invitations = await alice.call("invitations", "get_my_pending_invitations",);
      //  await delay(2000);

      alice_player.setSignalHandler((signal) => {
          console.log("Player Alice has received Signal:",signal.data.payload.payload);
      })

      bob_player.setSignalHandler((signal) => {
        console.log("Player has received Signal:",signal.data.payload.payload);
      })

      let result = await sendInvitation(bobPubKey)(bob);
      await delay(4000);

      // {
      //     invitation: {
      //       inviter: <Buffer 84 20 24 5e 4b 99 bd 3c b4 df 0c 6f ff 2a 90 6d 1d 76 17 0e 01 60 ed a9 fb 1d 0d f7 be 41 bf d0 7d 46 4e c0 d8 65 19>,
      //       invitees: [Array],
      //       timestamp: [Object]
      //     },
      //     invitation_entry_hash: <Buffer 84 21 24 7b 93 1e eb 0a be 8c c7 e5 24 0f d5 ae c0 a3 ff 09 77 2c d3 b3 05 fb 2c 53 df 7f b0 6f 99 88 47 75 54 0e cf>,
      //     invitation_header_hash: <Buffer 84 29 24 89 02 eb ea 2e 12 df 87 c9 de d7 8a d9 e7 82 5f a5 56 bc 58 31 aa ce 4a 3a 58 a2 3c 78 12 35 4b 56 63 a2 b3>,
      //     invitees_who_accepted: [],
      //     invitees_who_rejected: []
      // }
  

      let bobby_invitations = await getPendingInvitations(bob);
      await delay(2000);
      let  alice_invitations = await getPendingInvitations(alice);
      await delay(2000);

      t.equal(alice_invitations.length, 1)

      console.log("bob's public key:",bobPubKey);
      console.log(`Bobby Invitation list:`);
      console.log(bobby_invitations);
      console.log(bobby_invitations[0].invitation.timestamp);
      
      
      console.log("Alice's public key:",alicePubKey);
      console.log(`Alice Invitation list:`);
      console.log(alice_invitations);


      // await rejectInvitation(bobby_invitations[0].invitation_entry_hash)(bobby_conductor);
      // await delay(1000);
      await acceptInvitation(bobby_invitations[0].invitation_entry_hash)(bob);
      await delay(1000);

      await clearInvitation(bobby_invitations[0].invitation_entry_hash)(bob);
      await delay(3000);

      await clearInvitation(bobby_invitations[0].invitation_entry_hash)(alice);
      alice_invitations = await getPendingInvitations(alice);
      console.log("alice's invitations:",alice_invitations)

      t.equal(alice_invitations.length, 0)
      // bobby_invitations = await getPendingInvitations(bobby_conductor);
      // await delay(100);

      // alice_invitations = await getPendingInvitations(alice_conductor);
      // await delay(100);

      // console.log(bobbyPubKey);
      // console.log(`Bobby Invitation list:`);
      // console.log(bobby_invitations);

      // console.log(alicePubKey);
      // console.log(`Alice Invitation list:`);
      // console.log(alice_invitations);
      

  });