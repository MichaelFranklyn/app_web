import { gql } from "@apollo/client";

export const MY_NOTIFICATIONS_QUERY = gql`
  query MyNotifications($input: BaseListInput!) {
    my_notifications: myNotifications(input: $input) {
      edges {
        node {
          id
          severity
          category
          title
          body
          link
          relatedEntityType
          relatedEntityId
          isRead
          readAt
          createdAt
        }
      }
      totalCount
    }
  }
`;

export const MY_UNREAD_NOTIFICATIONS_COUNT_QUERY = gql`
  query MyUnreadNotificationsCount {
    myUnreadNotificationsCount {
      status
      data
    }
  }
`;

export const MARK_NOTIFICATION_AS_READ_MUTATION = gql`
  mutation MarkNotificationAsRead($id: UUID!) {
    markNotificationAsRead(id: $id) {
      status
      message
      data {
        id
        isRead
        readAt
      }
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead {
      status
      message
    }
  }
`;
