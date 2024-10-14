import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaGithub, FaSlack, FaDiscord } from "react-icons/fa";
import ServiceHelp from "./service-help";
import { ApiHandler } from "@/hooks/use-api";

interface AccountLinkingProps {
  selectedService: string;
  githubId: string;
  slackId: string;
  discordId: string;
  setSelectedService: (service: string) => void;
  setGithubId: (id: string) => void;
  setSlackId: (id: string) => void;
  setDiscordId: (id: string) => void;
}

const AccountLinking = ({
  selectedService,
  githubId,
  slackId,
  discordId,
  setSelectedService,
  setGithubId,
  setSlackId,
  setDiscordId,
}: AccountLinkingProps) => {
  const handleAccountLinking = async (
    githubId: string,
    slackId: string,
    discordId: string,
  ) => {
    const { apiRequest } = ApiHandler();

    const payload = {
      github_user_id: githubId,
      slack_channel_id: slackId,
      discord_channel_id: discordId,
    };

    try {
      // APIリクエストをuseApiフックで実行
      const response = await apiRequest({
        method: "PUT",
        url: `/users/me`,
        body: payload,
      });

      if (response) {
        console.log("Account linked successfully");
      }
    } catch (error) {
      console.error("Error linking account:", error);
    }
  };

  console.log("githubId=", githubId);
  console.log("slackId=", slackId);
  console.log("discordId=", discordId);

  return (
    <div className="mb-8">
      {/* サービスボタン */}
      <div className="grid grid-cols-3 gap-4">
        <Button
          variant="outline"
          onClick={() => setSelectedService("github")}
          className="bg-black dark:bg-white text-white dark:text-black"
        >
          <FaGithub className="text-[30px]" />
        </Button>
        <Button
          variant="outline"
          onClick={() => setSelectedService("slack")}
          className="bg-black dark:bg-white text-white dark:text-black"
        >
          <FaSlack className="text-[30px]" />
        </Button>
        <Button
          variant="outline"
          onClick={() => setSelectedService("discord")}
          className="bg-black dark:bg-white text-white dark:text-black"
        >
          <FaDiscord className="text-[30px]" />
        </Button>
      </div>

      {/* GitHub入力 */}
      {selectedService === "github" && (
        <div className="mt-4">
          <div className="flex h-6 items-center">
            <Label htmlFor="github-id">GitHub ID</Label>
            <ServiceHelp className="mx-3" />
          </div>
          <Input
            id="github-id"
            value={githubId}
            onChange={(e) => setGithubId(e.target.value)}
            className="bg-gray-700 dark:bg-white text-white dark:text-black"
          />
        </div>
      )}

      {/* Slack入力 */}
      {selectedService === "slack" && (
        <div className="mt-4">
          <div className="flex h-6 items-center">
            <Label htmlFor="slack-id">Slack channel_ID</Label>
            <ServiceHelp className="mx-3" />
          </div>
          <Input
            id="slack-id"
            value={slackId}
            onChange={(e) => setSlackId(e.target.value)}
            className="bg-gray-700 dark:bg-white text-white dark:text-black"
          />
        </div>
      )}

      {/* Discord入力 */}
      {selectedService === "discord" && (
        <div className="mt-4">
          <div className="flex h-6 items-center">
            <Label htmlFor="discord-id">Discord channel_ID</Label>
            <ServiceHelp className="mx-3" />
          </div>
          <Input
            id="discord-id"
            value={discordId}
            onChange={(e) => setDiscordId(e.target.value)}
            className="bg-gray-700 dark:bg-white text-white dark:text-black"
          />
        </div>
      )}

      {/* アカウント連携ボタン */}
      <Button
        onClick={() => handleAccountLinking(githubId, slackId, discordId)}
        className="mt-2 w-full"
      >
        Link Account
      </Button>
    </div>
  );
};

export default AccountLinking;
