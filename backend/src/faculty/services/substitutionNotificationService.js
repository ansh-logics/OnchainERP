const { Notification, FacultySubstitution, Faculty, User, Course, Section, Timetable } = require('../../shared/db/models');

class SubstitutionNotificationService {
  
  /**
   * Notify substitute faculty about a new substitution request
   */
  async notifySubstitutionRequest(substitution) {
    try {
      const notification = await Notification.create({
        userId: substitution.substituteFaculty.userId,
        type: 'substitution_request',
        title: 'New Substitution Request',
        message: `${substitution.absentFaculty.user.name} has requested you to substitute for ${substitution.course.name} on ${substitution.date}`,
        data: {
          substitutionId: substitution.id,
          courseId: substitution.courseId,
          date: substitution.date,
          absentFacultyName: substitution.absentFaculty.user.name,
          courseName: substitution.course.name,
          sectionName: substitution.section.name,
          startTime: substitution.timetable.startTime,
          endTime: substitution.timetable.endTime
        },
        priority: 'high',
        isRead: false
      });

      return notification;
    } catch (error) {
      console.error('Error creating substitution request notification:', error);
      throw error;
    }
  }

  /**
   * Notify absent faculty about substitution request status update
   */
  async notifySubstitutionResponse(substitution, action) {
    try {
      const statusMessages = {
        confirmed: 'has accepted your substitution request',
        rejected: 'has declined your substitution request'
      };

      const notification = await Notification.create({
        userId: substitution.absentFaculty.userId,
        type: 'substitution_response',
        title: `Substitution Request ${action === 'confirmed' ? 'Accepted' : 'Declined'}`,
        message: `${substitution.substituteFaculty.user.name} ${statusMessages[action]} for ${substitution.course.name} on ${substitution.date}`,
        data: {
          substitutionId: substitution.id,
          courseId: substitution.courseId,
          date: substitution.date,
          substituteFacultyName: substitution.substituteFaculty.user.name,
          courseName: substitution.course.name,
          sectionName: substitution.section.name,
          action: action,
          remarks: substitution.remarks
        },
        priority: action === 'confirmed' ? 'medium' : 'high',
        isRead: false
      });

      return notification;
    } catch (error) {
      console.error('Error creating substitution response notification:', error);
      throw error;
    }
  }

  /**
   * Notify admin about new substitution request
   */
  async notifyAdminNewSubstitution(substitution, adminUserIds) {
    try {
      const notifications = [];

      for (const adminUserId of adminUserIds) {
        const notification = await Notification.create({
          userId: adminUserId,
          type: 'admin_substitution',
          title: 'New Faculty Substitution Request',
          message: `${substitution.absentFaculty.user.name} has requested a substitution for ${substitution.course.name} on ${substitution.date}`,
          data: {
            substitutionId: substitution.id,
            courseId: substitution.courseId,
            date: substitution.date,
            absentFacultyName: substitution.absentFaculty.user.name,
            substituteFacultyName: substitution.substituteFaculty.user.name,
            courseName: substitution.course.name,
            departmentName: substitution.absentFaculty.department.name
          },
          priority: 'low',
          isRead: false
        });

        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Error creating admin substitution notifications:', error);
      throw error;
    }
  }

  /**
   * Notify both faculty about admin approval/rejection
   */
  async notifyAdminDecision(substitution, decision, adminName) {
    try {
      const notifications = [];
      
      const statusMessages = {
        approved: 'has been approved by administration',
        rejected: 'has been rejected by administration'
      };

      // Notify absent faculty
      const absentFacultyNotification = await Notification.create({
        userId: substitution.absentFaculty.userId,
        type: 'admin_decision',
        title: `Substitution Request ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Your substitution request for ${substitution.course.name} on ${substitution.date} ${statusMessages[decision]}`,
        data: {
          substitutionId: substitution.id,
          decision: decision,
          adminName: adminName,
          courseName: substitution.course.name,
          date: substitution.date,
          remarks: substitution.remarks
        },
        priority: decision === 'approved' ? 'medium' : 'high',
        isRead: false
      });

      notifications.push(absentFacultyNotification);

      // Notify substitute faculty (only if approved)
      if (decision === 'approved') {
        const substituteFacultyNotification = await Notification.create({
          userId: substitution.substituteFaculty.userId,
          type: 'admin_decision',
          title: 'Substitution Request Approved',
          message: `The substitution request for ${substitution.course.name} on ${substitution.date} has been approved by administration`,
          data: {
            substitutionId: substitution.id,
            decision: decision,
            adminName: adminName,
            courseName: substitution.course.name,
            date: substitution.date,
            absentFacultyName: substitution.absentFaculty.user.name
          },
          priority: 'medium',
          isRead: false
        });

        notifications.push(substituteFacultyNotification);
      }

      return notifications;
    } catch (error) {
      console.error('Error creating admin decision notifications:', error);
      throw error;
    }
  }

  /**
   * Send reminder notifications for upcoming substitutions
   */
  async sendUpcomingSubstitutionReminders(date) {
    try {
      // This would typically be called by a cron job
      const upcomingSubstitutions = await FacultySubstitution.findAll({
        where: {
          date: date,
          status: 'confirmed'
        },
        include: [
          {
            model: Faculty,
            as: 'substituteFaculty',
            include: [{ model: User, as: 'user' }]
          },
          { model: Course, as: 'course' },
          { model: Section, as: 'section' },
          { model: Timetable, as: 'timetable' }
        ]
      });

      const notifications = [];

      for (const substitution of upcomingSubstitutions) {
        const notification = await Notification.create({
          userId: substitution.substituteFaculty.userId,
          type: 'substitution_reminder',
          title: 'Substitution Reminder - Tomorrow',
          message: `Reminder: You have a class substitution tomorrow for ${substitution.course.name} (${substitution.section.name}) from ${substitution.timetable.startTime} to ${substitution.timetable.endTime}`,
          data: {
            substitutionId: substitution.id,
            date: substitution.date,
            courseName: substitution.course.name,
            sectionName: substitution.section.name,
            startTime: substitution.timetable.startTime,
            endTime: substitution.timetable.endTime,
            classroom: substitution.timetable.classroom?.name
          },
          priority: 'high',
          isRead: false
        });

        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Error sending substitution reminders:', error);
      throw error;
    }
  }
}

module.exports = new SubstitutionNotificationService();
